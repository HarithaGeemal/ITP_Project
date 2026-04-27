import express from "express";
import {
    getObservations,
    getObservationById,
    createObservation,
    updateObservation,
    deleteObservation
} from "../controllers/safetyObservationController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createSafetyObservationSchema,
    updateSafetyObservationSchema,
    deleteSafetyObservationSchema,
    observationIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getObservations)
    .post(validateRequest({ body: createSafetyObservationSchema }), createObservation);

router.route("/:observationId")
    .get(validateRequest({ params: observationIdParamSchema }), getObservationById)
    .put(validateRequest({ params: observationIdParamSchema, body: updateSafetyObservationSchema }), updateObservation)
    .delete(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: observationIdParamSchema, body: deleteSafetyObservationSchema }), deleteObservation);

export default router;
