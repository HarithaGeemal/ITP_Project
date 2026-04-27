import mongoose from "mongoose";

const toolSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        name: {
            type: String,
            required: true,
            trim: true
        },
        serialNumber: {
            type: String,
            trim: true
        },
        condition: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor"],
            default: "Good"
        },
        totalQuantity: {
            type: Number,
            required: true,
            min: 1,
            default: 1
        },
        availableQuantity: {
            type: Number,
            required: true,
            min: 0,
            default: 1
        },
        isBlacklisted: {
            type: Boolean,
            default: false
        },
        notes: {
            type: String
        }
    },
    { timestamps: true }
);

export default mongoose.model("tools", toolSchema);
