import express from "express";
import { validateRequest } from "../middlewares/validateRequest.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import {
    createSafetyIncidentSchema,
    updateSafetyIncidentSchema,
    deleteSafetyIncidentSchema,
    incidentIdParamSchema
} from "../validations/schemas.js";
import {
    createIncident,
    getIncidents,
    getIncidentById,
    updateIncident,
    deleteIncident,
    getCriticalIncidents
} from "../controllers/safetyIncidentController.js";

const router = express.Router({ mergeParams: true });

// Specific routes first
router.get("/critical", authorizeProjectAccess("SAFETY_OFFICER"), getCriticalIncidents);

// General CRUD
router.post("/", authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ body: createSafetyIncidentSchema }), createIncident);
router.get("/", authorizeProjectAccess("STORE_KEEPER"), getIncidents);
router.get("/:incidentId", validateRequest({ params: incidentIdParamSchema }), authorizeProjectAccess("STORE_KEEPER"), getIncidentById);
router.put("/:incidentId", validateRequest({ params: incidentIdParamSchema, body: updateSafetyIncidentSchema }), authorizeProjectAccess("SAFETY_OFFICER"), updateIncident);
router.delete("/:incidentId", validateRequest({ params: incidentIdParamSchema, body: deleteSafetyIncidentSchema }), authorizeProjectAccess("SAFETY_OFFICER"), deleteIncident);

export default router;
