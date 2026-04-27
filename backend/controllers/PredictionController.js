/**
 * Prediction Controller
 * Handles prediction requests and responses
 */

const DelayPrediction = require('../models/DelayPrediction');
const PredictionService = require('../services/PredictionService');

class PredictionController {
    /**
     * POST /api/predictions/delay
     * Create a new delay prediction
     */
    static async predictDelay(req, res) {
        try {
            // Extract and validate input
            const inputData = req.body;

            console.log('Received prediction request');
            console.log('Input:', inputData);

            // Validate input
            PredictionService.validateInput(inputData);

            // Prepare data for ML API
            const mlInput = PredictionService.prepareMLInput(inputData);

            console.log('Sending to ML API...');

            // Call ML API
            const mlResponse = await PredictionService.callMLAPI(mlInput);

            if (!mlResponse.success) {
                return res.status(400).json({
                    success: false,
                    error: mlResponse.error
                });
            }

            // Create and save prediction record
            const prediction = await DelayPrediction.createFromMLResponse(
                mlResponse,
                inputData,
                req.user?.id // Optional: user ID from auth middleware
            );

            await prediction.save();

            console.log('Prediction saved to database');

            // Return response
            res.json({
                success: true,
                prediction: {
                    id: prediction._id,
                    projectName: prediction.projectName,
                    city: prediction.city,
                    predictions: {
                        riskLevel: prediction.predictions.riskLevel,
                        riskProbability: prediction.predictions.riskProbability,
                        delayDays: prediction.predictions.delayDays
                    },
                    createdAt: prediction.createdAt
                }
            });

        } catch (error) {
            console.error('Prediction error:', error.message);

            // Try to save error prediction if data validation passed
            if (req.body?.projectName) {
                try {
                    const errorPrediction = new DelayPrediction({
                        projectName: req.body.projectName,
                        city: req.body.city,
                        inputFeatures: {
                            task_duration_days: req.body.task_duration_days,
                            labour_required: req.body.labour_required,
                            equipment_units: req.body.equipment_units,
                            material_cost_usd: req.body.material_cost_usd,
                            start_constraint: req.body.start_constraint,
                            resource_constraint_score: req.body.resource_constraint_score,
                            site_constraint_score: req.body.site_constraint_score,
                            dependency_count: req.body.dependency_count
                        },
                        status: 'error',
                        errorMessage: error.message
                    });
                    await errorPrediction.save();
                } catch (saveError) {
                    console.error('Failed to save error prediction:', saveError.message);
                }
            }

            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/delay/:id
     * Get a specific prediction by ID
     */
    static async getPrediction(req, res) {
        try {
            const prediction = await DelayPrediction.findById(req.params.id);

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    error: 'Prediction not found'
                });
            }

            res.json({
                success: true,
                prediction
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * PUT /api/predictions/delay/:id
     * Update a prediction by ID
     */
    static async updatePrediction(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            // Find and update the prediction
            const prediction = await DelayPrediction.findByIdAndUpdate(
                id,
                {
                    ...updateData,
                    updatedAt: new Date()
                },
                { new: true, runValidators: true }
            );

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    error: 'Prediction not found'
                });
            }

            console.log(`Prediction ${id} updated successfully`);

            res.json({
                success: true,
                message: 'Prediction updated successfully',
                prediction
            });

        } catch (error) {
            console.error('Update error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * DELETE /api/predictions/delay/:id
     * Delete a prediction by ID
     */
    static async deletePrediction(req, res) {
        try {
            const { id } = req.params;

            const prediction = await DelayPrediction.findByIdAndDelete(id);

            if (!prediction) {
                return res.status(404).json({
                    success: false,
                    error: 'Prediction not found'
                });
            }

            console.log(`Prediction ${id} deleted successfully`);

            res.json({
                success: true,
                message: 'Prediction deleted successfully',
                deletedPrediction: prediction
            });

        } catch (error) {
            console.error('Delete error:', error.message);
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/delay
     * Get all predictions with optional filtering
     */
    static async getAllPredictions(req, res) {
        try {
            const { projectId, riskLevel, limit = 10, skip = 0 } = req.query;

            // Build filter
            const filter = {};
            if (projectId) filter.projectId = projectId;
            if (riskLevel) filter['predictions.riskLevel'] = riskLevel;

            // Query
            const predictions = await DelayPrediction
                .find(filter)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip));

            // Count total
            const total = await DelayPrediction.countDocuments(filter);

            res.json({
                success: true,
                predictions,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    skip: parseInt(skip),
                    pages: Math.ceil(total / parseInt(limit))
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/project/:projectId
     * Get all predictions for a specific project
     */
    static async getProjectPredictions(req, res) {
        try {
            const { projectId } = req.params;
            const { limit = 10, skip = 0 } = req.query;

            const predictions = await DelayPrediction
                .find({ projectId })
                .sort({ createdAt: -1 })
                .limit(parseInt(limit))
                .skip(parseInt(skip));

            const total = await DelayPrediction.countDocuments({ projectId });

            res.json({
                success: true,
                predictions,
                pagination: {
                    total,
                    limit: parseInt(limit),
                    skip: parseInt(skip)
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/stats
     * Get prediction statistics
     */
    static async getPredictionStats(req, res) {
        try {
            const riskDistribution = await DelayPrediction.aggregate([
                {
                    $group: {
                        _id: '$predictions.riskLevel',
                        count: { $sum: 1 },
                        avgProbability: { $avg: '$predictions.riskProbability' },
                        avgDelayDays: { $avg: '$predictions.delayDays' }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            const totalPredictions = await DelayPrediction.countDocuments();
            const averageDelay = await DelayPrediction.aggregate([
                {
                    $group: {
                        _id: null,
                        avgDelay: { $avg: '$predictions.delayDays' }
                    }
                }
            ]);

            res.json({
                success: true,
                stats: {
                    totalPredictions,
                    riskDistribution,
                    averageDelayDays: averageDelay[0]?.avgDelay || 0,
                    riskBreakdown: {
                        low: riskDistribution.find(d => d._id === 'Low')?.count || 0,
                        medium: riskDistribution.find(d => d._id === 'Medium')?.count || 0,
                        high: riskDistribution.find(d => d._id === 'High')?.count || 0
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/health
     * Check ML API health
     */
    static async checkHealth(req, res) {
        try {
            const mlHealth = await PredictionService.checkMLAPIHealth();

            res.json({
                success: true,
                mlAPI: mlHealth
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }

    /**
     * GET /api/predictions/model-info
     * Get ML model information
     */
    static async getModelInfo(req, res) {
        try {
            const modelInfo = await PredictionService.getModelInfo();

            res.json({
                success: true,
                modelInfo
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
}

module.exports = PredictionController;

