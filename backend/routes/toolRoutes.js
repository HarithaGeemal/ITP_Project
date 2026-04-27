import express from "express";
import {
    getTools,
    getToolById,
    createTool,
    updateTool,
    deleteTool,
    toggleBlacklist
} from "../controllers/toolController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createToolSchema,
    updateToolSchema,
    toolIdParamSchema,
    blacklistToolSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

// Read access for everyone from Assistant Eng and up
router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getTools)
    .post(authorizeProjectAccess("STORE_KEEPER"), validateRequest({ body: createToolSchema }), createTool);

// SPECIAL FUNCTION: Safety Officer Blacklisting Route
router.route("/:toolId/blacklist")
    .patch(
        authorizeProjectAccess("SAFETY_OFFICER"), 
        validateRequest({ params: toolIdParamSchema, body: blacklistToolSchema }), 
        toggleBlacklist
    );

router.route("/:toolId")
    .get(validateRequest({ params: toolIdParamSchema }), getToolById)
    .put(authorizeProjectAccess("STORE_KEEPER"), validateRequest({ params: toolIdParamSchema, body: updateToolSchema }), updateTool)
    .delete(authorizeProjectAccess("STORE_KEEPER"), validateRequest({ params: toolIdParamSchema }), deleteTool);

export default router;
