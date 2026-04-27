import mongoose from "mongoose";

const workerSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true,
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
            index: true,
        },
        name: { type: String, required: true },
        trade: {
            type: String,
            enum: [
                "Plumber",
                "Electrician",
                "Carpenter",
                "Painter",
                "Welder",
                "Mason",
                "Operator",
                "General Laborer",
                "Foreman",
                "Supervisor",
                "Other",
            ],
            required: true,
        },
        phone: { type: String },
        nic: { type: String },
        status: {
            type: String,
            enum: ["Active", "On Leave", "Inactive"],
            default: "Active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Worker", workerSchema);
