import express from "express";
import { getSEDashboardMetrics, getSEAssignedTasks, getSESubtaskApprovals, getSEMaterialRequests, getSEProjects } from "../controllers/seDashboardController.js";
import { createSubtask, requestSubtaskCompletion, approveSubtaskCompletion, updateSubtask, deleteSubtask } from "../controllers/subtaskController.js";
import protect from "../middlewares/authMiddleware.js";
import Timesheet from "../models/timesheet.js";
import Worker from "../models/worker.js";
import Project from "../models/projects.js";
import ProjectMembership from "../models/projectMembership.js";

const router = express.Router();

router.use(protect);

// Dashboards and Analytics
router.get("/metrics", getSEDashboardMetrics);

// Distinct Task streams
router.get("/assigned-tasks", getSEAssignedTasks);
router.get("/subtask-approvals", getSESubtaskApprovals);
router.get("/my-projects", getSEProjects);

// Subtask Operations
router.post("/projects/:projectId/tasks/:taskId/subtasks", createSubtask);
router.put("/projects/:projectId/tasks/:taskId/subtasks/:subtaskId", updateSubtask);
router.delete("/projects/:projectId/tasks/:taskId/subtasks/:subtaskId", deleteSubtask);
router.patch("/projects/:projectId/subtasks/:subtaskId/request-completion", requestSubtaskCompletion);
router.patch("/projects/:projectId/subtasks/:subtaskId/approve-completion", approveSubtaskCompletion);

// Material Streams
router.get("/material-requests", getSEMaterialRequests);

// ==========================================
// TIMESHEET APPROVAL (SE reviews Worker hours)
// ==========================================

// @desc    Get all pending timesheets for the SE's assigned projects
// @route   GET /api/se/pending-timesheets
// @access  Site Engineer
router.get("/pending-timesheets", async (req, res) => {
    try {
        // Find projects the SE is assigned to via ProjectMembership
        const memberships = await ProjectMembership.find({ 
            userId: req.user._id, 
            $or: [{ role: "SITE_ENGINEER" }, { role: "PROJECT_MANAGER" }],
            removedAt: null 
        }).select("projectId");

        const projectIds = memberships.map(m => m.projectId);

        const timesheets = await Timesheet.find({
            projectId: { $in: projectIds },
            status: "Pending"
        })
            .populate("projectId", "name")
            .populate("userId", "name email")
            .sort({ date: -1 });

        return res.status(200).json({ success: true, timesheets });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Approve a worker's timesheet
// @route   PATCH /api/se/timesheets/:id/approve
// @access  Site Engineer
router.patch("/timesheets/:id/approve", async (req, res) => {
    try {
        const ts = await Timesheet.findById(req.params.id);
        if (!ts) return res.status(404).json({ success: false, message: "Timesheet not found." });
        if (ts.status !== "Pending") return res.status(400).json({ success: false, message: `Timesheet is already ${ts.status}.` });

        ts.status = "Approved";
        ts.approvedBy = req.user._id;
        ts.approvalNote = req.body.note || "Approved by Site Engineer";
        await ts.save();

        return res.status(200).json({ success: true, message: "Timesheet approved.", timesheet: ts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// @desc    Reject a worker's timesheet
// @route   PATCH /api/se/timesheets/:id/reject
// @access  Site Engineer
router.patch("/timesheets/:id/reject", async (req, res) => {
    try {
        const ts = await Timesheet.findById(req.params.id);
        if (!ts) return res.status(404).json({ success: false, message: "Timesheet not found." });
        if (ts.status !== "Pending") return res.status(400).json({ success: false, message: `Timesheet is already ${ts.status}.` });

        ts.status = "Rejected";
        ts.approvedBy = req.user._id;
        ts.approvalNote = req.body.note || "Rejected by Site Engineer";
        await ts.save();

        return res.status(200).json({ success: true, message: "Timesheet rejected.", timesheet: ts });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
