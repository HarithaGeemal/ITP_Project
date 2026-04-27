import mongoose from "mongoose";

const permitToWorkSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "subtasks",
            required: true,
            index: true
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        permitType: {
            type: String,
            enum: ["Hot Work", "Confined Space", "Working at Heights", "Excavation", "General"],
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Denied", "Revoked"],
            default: "Pending"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        approvedAt: { type: Date },
        validUntil: { type: Date },
        notes: { type: String }
    },
    { timestamps: true }
);

export default mongoose.model("PermitToWork", permitToWorkSchema);
