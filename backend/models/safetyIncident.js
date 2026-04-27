import mongoose from "mongoose";

const safetyIncidentSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        reportedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        incidentDate: { type: Date, required: true },
        incidentType: {
            type: String,
            enum: ["Near Miss", "Injury", "Equipment Accident", "Fire Hazard", "Unsafe Act", "Other"],
            required: true
        },
        location: { type: String, required: true },
        description: { type: String, required: true },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true
        },
        injuryReported: { type: Boolean, default: false },
        affectedPersons: { type: Number, min: 0, default: 0 },
        immediateActionTaken: { type: String },
        followUpAction: { type: String },
        status: {
            type: String,
            enum: ["Open", "Under Investigation", "Resolved", "Closed"],
            default: "Open"
        },
        requiresImmediateAttention: { type: Boolean, default: false }
    },
    { timestamps: true }
);

export default mongoose.model("SafetyIncident", safetyIncidentSchema);
