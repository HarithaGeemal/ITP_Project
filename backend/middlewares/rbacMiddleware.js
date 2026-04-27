import mongoose from "mongoose";
import Project from "../models/projects.js";
import ProjectMembership from "../models/projectMembership.js";
import Task from "../models/task.js";
import Issue from "../models/issue.js";
import TaskAssignment from "../models/taskAssignment.js";
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ----------------------------------------------------
// Object Loaders
// ----------------------------------------------------

/**
 * Loads a project by ID from req.params.projectId
 * Automatically verifies it exists and is not deleted.
 */
export const loadProject = async (req, res, next) => {
    try {
        const projectId = req.params.projectId;
        if (!projectId) return res.status(400).json({ success: false, message: "Missing projectId" });
        if (!isValidId(projectId)) return res.status(400).json({ success: false, message: "Invalid projectId" });

        const project = await Project.findOne({ _id: projectId, isDeleted: false });
        if (!project) return res.status(404).json({ success: false, message: "Project not found" });

        req.project = project;
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error: loadProject" });
    }
};

/**
 * Loads a task by ID from req.params.taskId
 */
export const loadTask = async (req, res, next) => {
    try {
        const taskId = req.params.taskId;
        if (!taskId) return res.status(400).json({ success: false, message: "Missing taskId" });
        if (!isValidId(taskId)) return res.status(400).json({ success: false, message: "Invalid taskId" });

        const task = await Task.findOne({ _id: taskId, isCancled: false });
        if (!task) return res.status(404).json({ success: false, message: "Task not found" });

        req.task = task;
        // Optionally auto-load project to avoid duplicates down the chain
        if (!req.project && task.projectId) {
            req.params.projectId = task.projectId.toString(); // Propagate for chained loadProject
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error: loadTask" });
    }
};

/**
 * Loads an issue by ID from req.params.issueId
 */
export const loadIssue = async (req, res, next) => {
    try {
        const issueId = req.params.issueId;
        if (!issueId) return res.status(400).json({ success: false, message: "Missing issueId" });
        if (!isValidId(issueId)) return res.status(400).json({ success: false, message: "Invalid issueId" });

        const issue = await Issue.findById(issueId);
        if (!issue) return res.status(404).json({ success: false, message: "Issue not found" });

        req.issue = issue;
        if (!req.project && issue.projectId) {
            req.params.projectId = issue.projectId.toString();
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error: loadIssue" });
    }
};

/**
 * Loads a task assignment by ID
 */
export const loadAssignment = async (req, res, next) => {
    try {
        const assignmentId = req.params.assignmentId;
        if (!assignmentId) return res.status(400).json({ success: false, message: "Missing assignmentId" });
        if (!isValidId(assignmentId)) return res.status(400).json({ success: false, message: "Invalid assignmentId" });

        const assignment = await TaskAssignment.findById(assignmentId);
        if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

        req.assignment = assignment;
        // We need to fetch the task to get the projectId, since assignments only have taskId
        const task = await Task.findOne({ _id: assignment.taskId, isCancled: false });
        if (!task) {
            return res.status(404).json({ success: false, message: "Associated task not found" });
        }
        if (task && !req.project) {
            req.params.projectId = task.projectId.toString();
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal server error: loadAssignment" });
    }
};

// ----------------------------------------------------
// Authorizers
// ----------------------------------------------------

const ROLE_PERMISSIONS_MATRIX = {
    "ASSISTANT_ENGINEER": ["OWNER", "PROJECT_MANAGER", "SAFETY_OFFICER", "SITE_ENGINEER", "STORE_KEEPER", "ASSISTANT_ENGINEER"],
    "STORE_KEEPER":       ["OWNER", "PROJECT_MANAGER", "SAFETY_OFFICER", "SITE_ENGINEER", "STORE_KEEPER"],
    "SITE_ENGINEER":      ["OWNER", "PROJECT_MANAGER", "SITE_ENGINEER"],
    "SAFETY_OFFICER":     ["OWNER", "PROJECT_MANAGER", "SAFETY_OFFICER"],
    "PROJECT_MANAGER":    ["OWNER", "PROJECT_MANAGER"],
    "OWNER":              ["OWNER"],
    "WORKER":             ["OWNER", "PROJECT_MANAGER", "SITE_ENGINEER", "WORKER"]
};

/**
 * Ensures req.user is a valid member of req.project and has at least the minimum allowed role.
 * Global ADMIN bypasses all project role checks.
 */
export const authorizeProjectAccess = (minimumRole = "ASSISTANT_ENGINEER") => {
    return async (req, res, next) => {
        try {
            if (!req.user) return res.status(401).json({ success: false, message: "Not authenticated" });
            if (!req.project) return res.status(400).json({ success: false, message: "Project context is required. Please use explicitly nested /api/projects/:projectId paths." });

            // Global Admins have implicit OWNER level access to everything
            if (req.user.userRole === "ADMIN") {
                req.membership = { role: "OWNER", isPrimary: true };
                return next();
            }

            // Normal users check the ProjectMembership table
            const membership = await ProjectMembership.findOne({
                projectId: req.project._id,
                userId: req.user._id,
                removedAt: null
            });

            if (!membership) {
                return res.status(403).json({ success: false, message: "Access denied. You are not an active member of this project." });
            }

            // Allow custom arrays OR the legacy string mapping
            let allowedRoles = [];
            if (Array.isArray(minimumRole)) {
                allowedRoles = minimumRole;
            } else {
                allowedRoles = ROLE_PERMISSIONS_MATRIX[minimumRole] || ["OWNER"]; // Default safe fallback
            }

            if (!allowedRoles.includes(membership.role)) {
                return res.status(403).json({
                    success: false,
                    message: `Access denied. Your role (${membership.role}) is not authorized for this action. Minimum required: ${minimumRole}`
                });
            }

            // Attach membership so controllers know *how* they are authorized
            req.membership = membership;
            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal server error: authorizeProjectAccess" });
        }
    };
};

/**
 * Ensures req.user has one of the specified global roles (e.g. ADMIN, STORE_KEEPER).
 * Used for non-project-scoped routes like creating master material items or users.
 */
export const authorizeGlobalRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Not authenticated" });
        }
        if (!roles.includes(req.user.userRole)) {
            return res.status(403).json({
                success: false,
                message: `Access denied. Requires one of: ${roles.join(", ")}`
            });
        }
        next();
    };
};
