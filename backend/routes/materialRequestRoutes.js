import express from "express";
import {
    getMaterialRequests,
    getMaterialRequestById,
    createMaterialRequest,
    approveWorkerMaterialRequest,
    denyWorkerMaterialRequest,
    addCommentToRequest
} from "../controllers/materialRequestController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createMaterialRequestSchema,
    materialRequestIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

// Read access for everyone from Assistant Eng and up
router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getMaterialRequests)
    .post(authorizeProjectAccess("SITE_ENGINEER"), validateRequest({ body: createMaterialRequestSchema }), createMaterialRequest);

router.route("/:requestId")
    .get(validateRequest({ params: materialRequestIdParamSchema }), getMaterialRequestById);


// SE specific mediator approval endpoint
router.route("/:requestId/se-approve")
    .patch(
        authorizeProjectAccess("SITE_ENGINEER"),
        validateRequest({ params: materialRequestIdParamSchema }),
        approveWorkerMaterialRequest
    );

// SE specific mediator deny endpoint
router.route("/:requestId/se-deny")
    .patch(
        authorizeProjectAccess("SITE_ENGINEER"),
        validateRequest({ params: materialRequestIdParamSchema }),
        denyWorkerMaterialRequest
    );

// Comments endpoint (SE and Store Keeper can comment)
router.route("/:requestId/comments")
    .post(
        authorizeProjectAccess("SITE_ENGINEER"),
        addCommentToRequest
    );

export default router;
