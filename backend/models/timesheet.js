import mongoose from "mongoose";

const timesheetSchema = new mongoose.Schema(
    {
        projectId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "projects",
            required: true,
            index: true
        },
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },
        date: {
            type: Date,
            required: true
        },
        hoursWorked: {
            type: Number,
            required: true,
            min: 0.5,
            max: 24
        },
        description: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ["Pending", "Approved", "Rejected"],
            default: "Pending"
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        approvalNote: {
            type: String
        }
    },
    { timestamps: true }
);

// Prevent duplicate entries for the same date+project+user
timesheetSchema.index({ userId: 1, projectId: 1, date: 1 }, { unique: true });

export default mongoose.model("timesheets", timesheetSchema);
