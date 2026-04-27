import mongoose from "mongoose";

const riskAssessmentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        // Auto-filled fields
        projectTimeline: { type: Number, required: true },    // days between start and end date
        labourCount: { type: Number, required: true },         // workers assigned to project
        averageWeather: { type: Number, required: true },      // avg weather score from daily reports (0-1)

        // PM-entered fields (mapped to ML model features)
        equipmentUnits: { type: Number, required: true, min: 0 },
        materialCostUSD: { type: Number, required: true, min: 0 },
        startConstraint: { type: Number, required: true, min: 0 },
        resourceConstraintScore: { type: Number, required: true, min: 0, max: 1 },
        siteConstraintScore: { type: Number, required: true, min: 0, max: 1 },
        dependencyCount: { type: Number, required: true, min: 0 },

        // ML prediction result (filled when Admin runs prediction)
        riskResult: {
            riskLevel: { type: String, enum: ["Low", "Medium", "High"], default: null },
            riskProbability: { type: Number, default: null },
            delayDays: { type: Number, default: null },
            riskColor: { type: String, default: null },
            predictedAt: { type: Date, default: null },
        },
    },
    { timestamps: true }
);

export default mongoose.model("RiskAssessment", riskAssessmentSchema);
