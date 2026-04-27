/**
 * DelayPrediction Model
 * Stores AI-generated delay predictions for construction projects
 */

const mongoose = require('mongoose');

const delayPredictionSchema = new mongoose.Schema(
    {
        projectName: {
            type: String,
            required: true,
            index: true
        },
        city: {
            type: String,
            required: false
        },

        // Input Features
        inputFeatures: {
            task_duration_days: {
                type: Number,
                required: true
            },
            labour_required: {
                type: Number,
                required: true
            },
            equipment_units: {
                type: Number,
                required: false
            },
            material_cost_usd: {
                type: Number,
                required: false
            },
            start_constraint: {
                type: Number,
                required: false
            },
            resource_constraint_score: {
                type: Number,
                required: false
            },
            site_constraint_score: {
                type: Number,
                required: false
            },
            dependency_count: {
                type: Number,
                required: false
            },
            weather_code: {
                type: Number,
                required: false
            },
            rain_sum: {
                type: Number,
                required: false
            },
            daylight_hours: {
                type: Number,
                required: false
            }
        },

        // Prediction Results
        predictions: {
            riskLevel: {
                type: String,
                enum: ['Low', 'Medium', 'High'],
                required: true,
                index: true
            },
            riskProbability: {
                type: Number,
                required: true,
                min: 0,
                max: 100
            },
            delayDays: {
                type: Number,
                required: true,
                min: 0
            }
        },

        // Model Metadata
        modelVersion: {
            type: String,
            default: '1.0.0'
        },
        confidenceScore: {
            type: Number,
            required: false,
            min: 0,
            max: 1
        },

        // User & Status
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: false
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'error'],
            default: 'completed',
            index: true
        },
        errorMessage: {
            type: String,
            required: false
        },

        // Timestamps
        createdAt: {
            type: Date,
            default: Date.now,
            index: true
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Indexes for efficient queries
delayPredictionSchema.index({ projectId: 1, createdAt: -1 });
delayPredictionSchema.index({ projectName: 1, createdAt: -1 });
delayPredictionSchema.index({ status: 1, createdAt: -1 });

// Virtual for risk level color coding
delayPredictionSchema.virtual('riskColor').get(function () {
    switch (this.predictions.riskLevel) {
        case 'Low':
            return 'green';
        case 'Medium':
            return 'yellow';
        case 'High':
            return 'red';
        default:
            return 'gray';
    }
});

// Method to get prediction summary
delayPredictionSchema.methods.getSummary = function () {
    return {
        projectName: this.projectName,
        riskLevel: this.predictions.riskLevel,
        riskProbability: this.predictions.riskProbability,
        delayDays: this.predictions.delayDays,
        createdAt: this.createdAt
    };
};

// Static method to create prediction from ML API response
delayPredictionSchema.statics.createFromMLResponse = function (mlResponse, projectData, userId) {
    // Extract predictions handling both camelCase and snake_case
    const pred = mlResponse.predictions || {};
    const riskLevel = pred.riskLevel || pred.risk_level || 'Medium';
    const riskProbability = pred.riskProbability || pred.risk_probability || 0;
    const delayDays = pred.delayDays || pred.delay_days || 0;

    return new this({
        projectId: projectData.projectId,
        projectName: projectData.projectName || mlResponse.input_summary?.projectName,
        city: projectData.city || mlResponse.input_summary?.city,
        inputFeatures: {
            task_duration_days: projectData.task_duration_days || mlResponse.input_summary?.duration_days,
            labour_required: projectData.labour_required || mlResponse.input_summary?.labour_required,
            equipment_units: projectData.equipment_units,
            material_cost_usd: projectData.material_cost_usd,
            start_constraint: projectData.start_constraint,
            resource_constraint_score: projectData.resource_constraint_score,
            site_constraint_score: projectData.site_constraint_score,
            dependency_count: projectData.dependency_count || mlResponse.input_summary?.dependency_count,
            weather_code: projectData.weather_code,
            rain_sum: projectData.rain_sum,
            daylight_hours: projectData.daylight_hours
        },
        predictions: {
            riskLevel: riskLevel,
            riskProbability: riskProbability,
            delayDays: delayDays
        },
        createdBy: userId,
        status: 'completed'
    });
};

module.exports = mongoose.model('DelayPrediction', delayPredictionSchema, 'ai_predictions');


