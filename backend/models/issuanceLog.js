import mongoose from "mongoose";

const issuanceLogSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["Material", "Tool"],
            required: true,
        },
        // For material issuances
        materialItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "material_items",
        },
        // For tool issuances
        mainStorageToolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "main_storage_tools",
        },
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
        },
        materialRequestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "material_requests",
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issuedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        issuedQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        issuedDate: {
            type: Date,
            default: Date.now,
            required: true,
        },
        status: {
            type: String,
            enum: ["Issued", "Returned"],
            default: "Issued",
        },

        // Tool-specific return fields
        conditionAtIssue: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor", "Damaged"],
        },
        conditionAtReturn: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor", "Damaged"],
        },
        returnDate: {
            type: Date,
        },
        damageNotes: {
            type: String,
            trim: true,
            default: "",
        },
    },
    { timestamps: true }
);

issuanceLogSchema.index({ projectId: 1, type: 1, issuedDate: -1 });
issuanceLogSchema.index({ status: 1, type: 1 });

export default mongoose.model("issuance_logs", issuanceLogSchema);
