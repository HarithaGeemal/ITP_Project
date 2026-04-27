import mongoose from "mongoose";

const safetyObservationSchema = new mongoose.Schema(
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
        title: { type: String, required: true },
        type: {
            type: String,
            enum: ["Unsafe Condition", "Unsafe Act", "Environmental", "Other"],
            required: true
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            required: true
        },
        location: { type: String, required: true },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
            default: null
        },
        dueDate: { type: Date },
        photos: [{ type: String }],
        status: {
            type: String,
            enum: ["Open", "Resolved", "Closed"],
            default: "Open"
        },
        notes: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("SafetyObservation", safetyObservationSchema);
