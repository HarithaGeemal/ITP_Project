import mongoose from "mongoose";

const materialRequestSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        taskId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "tasks",
            required: true
        },
        requestedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        requestType: {
            type: String,
            enum: ["Material", "Tool"],
            default: "Material"
        },
        materialItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "material_items"
        },
        toolId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "main_storage_tools"
        },
        requestedQuantity: {
            type: Number,
            required: true,
            min: 0.1
        },
        status: {
            type: String,
            enum: ["Pending SE Approval", "Pending", "Approved", "Denied"],
            default: "Pending"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        notes: {
            type: String
        },
        comments: [{
            text: { type: String, required: true },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            createdAt: { type: Date, default: Date.now }
        }]
    },
    { timestamps: true }
);

export default mongoose.model("material_requests", materialRequestSchema);
