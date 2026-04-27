import mongoose from "mongoose";

const subtaskSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "projects",
        required: true,
    },
    parentTaskId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "tasks",
        required: true,
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["Not Started", "In Progress", "Under Review", "Completed", "Cancelled", "On Hold"],
        default: "Not Started",
    },
    priority: {
        type: String,
        enum: ["Low", "Medium", "High", "Critical"],
        default: "Medium",
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    assignedWorkers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Worker",
    }],
    assignedSiteEngineer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completionRequested: {
        type: Boolean,
        default: false,
    },
    completionRequestedAt: {
        type: Date,
    },
    completionRequestedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completionApprovedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    completionApprovedAt: {
        type: Date,
    },
    isCancled: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

const Subtask = mongoose.model("subtasks", subtaskSchema);
export default Subtask;
