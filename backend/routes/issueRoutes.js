import express from "express";
import { loadIssue, authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createIssueSchema,
    issueIdParamSchema,
    updateIssueSchema,
    assignIssueSchema,
    resolveIssueSchema,
    getIssuesQuerySchema
} from "../validations/schemas.js";
import {
    createIssue,
    getIssuesByProject,
    getIssueById,
    updateIssue,
    updateIssueStatus,
    assignIssue,
    resolveIssue,
    closeIssue,
    deleteIssue,
} from "../controllers/issueController.js";

const router = express.Router();

// All routes mapped under /api/projects/:projectId/issues
router.post("/", validateRequest({ body: createIssueSchema }), authorizeProjectAccess("STORE_KEEPER"), createIssue);
router.get("/", validateRequest({ query: getIssuesQuerySchema }), authorizeProjectAccess("STORE_KEEPER"), getIssuesByProject);

// Load issue middleware array
const loadIssueMw = [validateRequest({ params: issueIdParamSchema }), loadIssue];

// IMPORTANT: Specific sub-paths MUST come before generic /:issueId routes
router.patch("/:issueId/status", loadIssueMw, authorizeProjectAccess("PROJECT_MANAGER"), updateIssueStatus);
router.patch("/:issueId/assign", loadIssueMw, validateRequest({ body: assignIssueSchema }), authorizeProjectAccess("PROJECT_MANAGER"), assignIssue);
router.patch("/:issueId/resolve", loadIssueMw, validateRequest({ body: resolveIssueSchema }), authorizeProjectAccess("SITE_ENGINEER"), resolveIssue);
router.patch("/:issueId/close", loadIssueMw, authorizeProjectAccess("PROJECT_MANAGER"), closeIssue);

// Generic single-issue routes
router.get("/:issueId", loadIssueMw, authorizeProjectAccess("STORE_KEEPER"), getIssueById);
router.put("/:issueId", loadIssueMw, validateRequest({ body: updateIssueSchema }), authorizeProjectAccess("SITE_ENGINEER"), updateIssue);
router.delete("/:issueId", loadIssueMw, authorizeProjectAccess("SITE_ENGINEER"), deleteIssue);

export default router;
