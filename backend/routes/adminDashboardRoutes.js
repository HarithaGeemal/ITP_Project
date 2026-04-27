import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import {
    getAdminStats,
    getAllProjectsAdmin,
} from "../controllers/adminDashboardController.js";

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(protect);
router.use(authorizeGlobalRole("ADMIN"));

router.get("/stats", getAdminStats);
router.get("/projects", getAllProjectsAdmin);

export default router;
