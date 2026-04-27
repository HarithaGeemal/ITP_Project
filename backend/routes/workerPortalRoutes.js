import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import Worker from "../models/worker.js";
import Task from "../models/task.js";
import Subtask from "../models/subtask.js";
import HazardReport from "../models/hazardReport.js";
import SafetyNotice from "../models/safetyNotice.js";
import MaterialRequest from "../models/materialRequest.js";
import Timesheet from "../models/timesheet.js";
import PermitToWork from "../models/permitToWork.js";
import { startSubtask } from "../controllers/subtaskController.js";

const router = express.Router();

// Mount generic RBAC
router.use(protect, authorizeGlobalRole("WORKER", "ADMIN"));

// @desc    Get dashboard metrics and assigned tasks for the logged in worker
// @route   GET /api/worker/dashboard
// @access  Worker
router.get("/dashboard", async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all Worker profiles associated with this User and populate the project
        const workerProfiles = await Worker.find({ userId }).populate("projectId", "name");
        const workerIds = workerProfiles.map(w => w._id);

        if (workerIds.length === 0) {
            return res.status(200).json({
                success: true,
                projectsCount: 0,
                assignedProjects: [],
                assignedTasks: [],
                assignedSubtasks: [],
            });
        }

        const assignedProjects = workerProfiles.map(w => w.projectId);

        // Subtasks assigned strictly to these worker IDs
        const assignedSubtasks = await Subtask.find({
            assignedWorkers: { $in: workerIds },
            status: { $in: ["Not Started", "Pending", "In Progress", "Review"] } // Active subtasks
        }).populate("parentTaskId", "name projectId")
            .populate("projectId", "name")
            .lean();

        // Fetch PTWs for these subtasks (safe - won't break dashboard if PTW fails)
        let subtasksWithPtw = assignedSubtasks;
        try {
            const subtaskIds = assignedSubtasks.map(s => s._id);
            const ptws = await PermitToWork.find({ taskId: { $in: subtaskIds } }).lean();

            // Attach PTW to each subtask
            subtasksWithPtw = assignedSubtasks.map(sub => {
                const ptw = ptws.find(p => p.taskId.toString() === sub._id.toString());
                return { ...sub, ptw: ptw || null };
            });
        } catch (ptwErr) {
            console.error("PTW fetch failed (non-critical):", ptwErr.message);
        }

        // Main tasks where the worker might be assigned
        const assignedTasks = await Task.find({
            assignedWorkers: { $in: workerIds },
            status: { $in: ["Not Started", "In Progress"] },
            isCancled: false
        }).populate("projectId", "name");

        return res.status(200).json({
            success: true,
            projectsCount: workerProfiles.length,
            assignedProjects,
            assignedTasks,
            assignedSubtasks: subtasksWithPtw,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Get safety notices and hazards for the logged in worker's projects
// @route   GET /api/worker/safety
// @access  Worker
router.get("/safety", async (req, res) => {
    try {
        const userId = req.user._id;

        // Find all Worker profiles associated with this User to get their assigned projects
        const workerProfiles = await Worker.find({ userId });
        const projectIds = workerProfiles.map(w => w.projectId);

        if (projectIds.length === 0) {
            return res.status(200).json({
                success: true,
                hazards: [],
                safetyNotices: [],
            });
        }

        // Fetch active/open safety items for their projects
        const hazards = await HazardReport.find({
            projectId: { $in: projectIds },
            status: { $in: ["Open", "Controlled"] } // Workers only need to see active hazards ideally, but we fetch Open/Controlled
        }).populate("projectId", "name").populate("reportedBy", "name").sort({ createdAt: -1 });

        const safetyNotices = await SafetyNotice.find({
            projectId: { $in: projectIds },
            status: "Active"
        }).populate("projectId", "name").populate("issuedBy", "name").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            hazards,
            safetyNotices,
        });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Worker requests completion of their assigned subtask
// @route   PATCH /api/worker/subtasks/:subtaskId/request-completion
// @access  Worker
router.patch("/subtasks/:subtaskId/request-completion", async (req, res) => {
    try {
        const subtaskId = req.params.subtaskId;

        // Verify the subtask exists and the logged in user's Worker profile is assigned to it
        const workerProfiles = await Worker.find({ userId: req.user._id });
        const workerIds = workerProfiles.map(w => w._id);

        const subtask = await Subtask.findOne({
            _id: subtaskId,
            assignedWorkers: { $in: workerIds }
        });

        if (!subtask) {
            return res.status(404).json({ success: false, message: "Subtask not found or you are not assigned to it." });
        }

        // Validate PTW blockage exactly like the SE endpoint
        const deniedPtw = await PermitToWork.findOne({ taskId: subtaskId, status: "Denied" });
        if (deniedPtw) {
            return res.status(403).json({ success: false, message: "Cannot request completion: The Permit to Work for this subtask was explicitly denied by the Safety Officer." });
        }

        if (subtask.completionRequested || subtask.status === "Completed") {
            return res.status(400).json({ success: false, message: "Completion already requested or completed." });
        }

        subtask.completionRequested = true;
        subtask.completionRequestedAt = new Date();
        subtask.completionRequestedBy = req.user._id;

        await subtask.save();

        return res.status(200).json({ success: true, message: "Subtask completion successfully sent to your Site Engineer for review.", subtask });

    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Worker starts their assigned subtask
// @route   PATCH /api/worker/subtasks/:subtaskId/start
// @access  Worker
router.patch("/subtasks/:subtaskId/start", startSubtask);



// ==========================================
// DAILY TIMESHEETS (Worker CRUD)
// ==========================================

// @desc    Get all timesheets for the logged-in worker
// @route   GET /api/worker/timesheets
// @access  Worker
router.get("/timesheets", async (req, res) => {
    try {
        const timesheets = await Timesheet.find({ userId: req.user._id })
            .populate("projectId", "name")
            .populate("approvedBy", "name")
            .sort({ date: -1 });

        return res.status(200).json({ success: true, timesheets });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Create a new timesheet entry
// @route   POST /api/worker/timesheets
// @access  Worker
router.post("/timesheets", async (req, res) => {
    try {
        const { projectId, date, hoursWorked, description } = req.body;

        if (!projectId || !date || !hoursWorked || !description) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        // Verify worker is assigned to this project
        const workerProfile = await Worker.findOne({ userId: req.user._id, projectId });
        if (!workerProfile) {
            return res.status(403).json({ success: false, message: "You are not assigned to this project." });
        }

        const timesheet = await Timesheet.create({
            projectId,
            userId: req.user._id,
            date,
            hoursWorked,
            description
        });

        return res.status(201).json({ success: true, message: "Timesheet logged successfully.", timesheet });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "You already have a timesheet entry for this date and project." });
        }
        return res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Update a timesheet entry (only if still Pending)
// @route   PUT /api/worker/timesheets/:id
// @access  Worker
router.put("/timesheets/:id", async (req, res) => {
    try {
        const ts = await Timesheet.findOne({ _id: req.params.id, userId: req.user._id });
        if (!ts) return res.status(404).json({ success: false, message: "Timesheet not found." });

        if (ts.status !== "Pending") {
            return res.status(403).json({ success: false, message: "Cannot edit a timesheet that has been " + ts.status + "." });
        }

        const { hoursWorked, description, date } = req.body;
        if (hoursWorked !== undefined) ts.hoursWorked = hoursWorked;
        if (description !== undefined) ts.description = description;
        if (date !== undefined) ts.date = date;

        await ts.save();
        return res.status(200).json({ success: true, message: "Timesheet updated.", timesheet: ts });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Duplicate entry for this date and project." });
        }
        return res.status(400).json({ success: false, message: error.message });
    }
});

// @desc    Delete a timesheet entry (only if still Pending)
// @route   DELETE /api/worker/timesheets/:id
// @access  Worker
router.delete("/timesheets/:id", async (req, res) => {
    try {
        const ts = await Timesheet.findOne({ _id: req.params.id, userId: req.user._id });
        if (!ts) return res.status(404).json({ success: false, message: "Timesheet not found." });

        if (ts.status !== "Pending") {
            return res.status(403).json({ success: false, message: "Cannot delete a timesheet that has been " + ts.status + "." });
        }

        await ts.deleteOne();
        return res.status(200).json({ success: true, message: "Timesheet deleted." });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
