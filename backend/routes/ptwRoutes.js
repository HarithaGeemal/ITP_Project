import express from "express";
import {
    getPTWs,
    getPTWById,
    createPTW,
    updatePTW,
    deletePTW
} from "../controllers/ptwController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createPTWSchema,
    updatePTWSchema,
    deletePTWSchema,
    ptwIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getPTWs)
    .post(authorizeProjectAccess("SITE_ENGINEER"), validateRequest({ body: createPTWSchema }), createPTW);

router.route("/:ptwId")
    .get(validateRequest({ params: ptwIdParamSchema }), getPTWById)
    .put(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: ptwIdParamSchema, body: updatePTWSchema }), updatePTW)
    .delete(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: ptwIdParamSchema, body: deletePTWSchema }), deletePTW);

export default router;
