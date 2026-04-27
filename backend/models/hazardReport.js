import mongoose from "mongoose";

const hazardReportSchema = new mongoose.Schema(
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
        description: { type: String, required: true },
        controlActions: { type: String, required: true },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ["Open", "Controlled", "Closed"],
            default: "Open"
        }
    },
    { timestamps: true }
);

export default mongoose.model("HazardReport", hazardReportSchema);
