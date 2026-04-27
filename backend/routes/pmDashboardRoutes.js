import express from "express";
import protect from "../middlewares/authMiddleware.js";
import {
    getAllTasks,
    getAllIssues,
    getAllWorkers,
    getAllReports,
    getAllSafetyNotices,
    getAllSafetyObservations,
    getAllProjects,
    holdTask,
    getAvailableUsers,
    getStoreReports,
    updateNoticeSeverity
} from "../controllers/pmDashboardController.js";

const router = express.Router();

// All PM dashboard aggregation routes are protected by JWT Clerk auth
router.use(protect);

router.post("/hold-task", holdTask);
router.patch("/safety-notices/:noticeId/severity", updateNoticeSeverity);

router.get("/projects", getAllProjects);
router.get("/available-users", getAvailableUsers);
router.get("/tasks", getAllTasks);
router.get("/issues", getAllIssues);
router.get("/workers", getAllWorkers);
router.get("/reports", getAllReports);
router.get("/safety-notices", getAllSafetyNotices);
router.get("/safety-observations", getAllSafetyObservations);
router.get("/store-reports", getStoreReports);

export default router;
