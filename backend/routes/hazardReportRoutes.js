import express from "express";
import {
    getHazards,
    getHazardById,
    createHazard,
    updateHazard,
    deleteHazard
} from "../controllers/hazardReportController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createHazardReportSchema,
    updateHazardReportSchema,
    deleteHazardReportSchema,
    hazardIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getHazards)
    .post(validateRequest({ body: createHazardReportSchema }), createHazard);

router.route("/:hazardId")
    .get(validateRequest({ params: hazardIdParamSchema }), getHazardById)
    .put(validateRequest({ params: hazardIdParamSchema, body: updateHazardReportSchema }), updateHazard)
    .delete(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: hazardIdParamSchema, body: deleteHazardReportSchema }), deleteHazard);

export default router;
