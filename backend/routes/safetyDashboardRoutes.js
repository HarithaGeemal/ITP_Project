import express from "express";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { getSafetyHazards, getSafetySummary } from "../controllers/safetyDashboardController.js";

// Mount this at /api/projects/:projectId
const router = express.Router({ mergeParams: true });

router.get("/safety-hazards", authorizeProjectAccess("SAFETY_OFFICER"), getSafetyHazards);
router.get("/safety-summary", authorizeProjectAccess("SAFETY_OFFICER"), getSafetySummary);

export default router;
