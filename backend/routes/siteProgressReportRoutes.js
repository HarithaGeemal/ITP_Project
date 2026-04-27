import express from "express";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import { createSiteProgressReportSchema } from "../validations/schemas.js";
import {
    createReport,
    getReportsByProject,
    updateReport,
    deleteReport,
} from "../controllers/siteProgressReportController.js";

const router = express.Router();

router.post("/", validateRequest({ body: createSiteProgressReportSchema }), authorizeProjectAccess("SITE_ENGINEER"), createReport);
router.get("/", authorizeProjectAccess("STORE_KEEPER"), getReportsByProject);
router.put("/:id", authorizeProjectAccess("SITE_ENGINEER"), updateReport);
router.delete("/:id", authorizeProjectAccess("SITE_ENGINEER"), deleteReport);

export default router;
