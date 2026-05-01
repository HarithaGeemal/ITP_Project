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
// models/Worker.js
const mongoose = require('mongoose');

const workerSchema = new mongoose.Schema({
    name: { type: String, required: true },
    contact: { type: String, required: true },
    isAvailable: { type: Boolean, default: true }, // දැනට වැඩක ඉන්නවද නැද්ද?
    assignedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', default: null },
    dailyRate: { type: Number, required: true }
});

module.exports = mongoose.model('Worker', workerSchema);

export default mongoose.model("Worker", workerSchema);
