import mongoose from "mongoose";

const mainStorageToolSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        code: { type: String, required: true, trim: true, unique: true },
        quantity: { type: Number, required: true, min: 0, default: 0 },
        condition: {
            type: String,
            enum: ["New", "Good", "Fair", "Poor", "Damaged"],
            default: "New",
        },
        isArchived: { type: Boolean, default: false },
    },
    { timestamps: true }
);



export default mongoose.model("main_storage_tools", mainStorageToolSchema);
