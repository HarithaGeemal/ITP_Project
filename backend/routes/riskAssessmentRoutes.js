import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import {
    getAutoFillData,
    createRiskAssessment,
    getAllRiskAssessments,
    getRiskAssessmentsByProject,
    deleteRiskAssessment,
    runPrediction,
} from "../controllers/riskAssessmentController.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// PM routes
router.get("/autofill/:projectId", getAutoFillData);
router.post("/", authorizeGlobalRole("PROJECT_MANAGER", "ADMIN"), createRiskAssessment);
router.get("/project/:projectId", getRiskAssessmentsByProject);

// Admin routes
router.get("/", authorizeGlobalRole("ADMIN"), getAllRiskAssessments);
router.delete("/:id", authorizeGlobalRole("ADMIN"), deleteRiskAssessment);
router.post("/:id/predict", authorizeGlobalRole("ADMIN"), runPrediction);

export default router;
