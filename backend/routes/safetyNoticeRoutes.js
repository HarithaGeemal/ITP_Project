import express from "express";
import {
    getNotices,
    getNoticeById,
    createNotice,
    updateNotice,
    deleteNotice
} from "../controllers/safetyNoticeController.js";
import { authorizeProjectAccess } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createSafetyNoticeSchema,
    updateSafetyNoticeSchema,
    deleteSafetyNoticeSchema,
    noticeIdParamSchema
} from "../validations/schemas.js";

const router = express.Router({ mergeParams: true });

router.use(authorizeProjectAccess("ASSISTANT_ENGINEER"));

router.route("/")
    .get(getNotices)
    .post(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ body: createSafetyNoticeSchema }), createNotice);

router.route("/:noticeId")
    .get(validateRequest({ params: noticeIdParamSchema }), getNoticeById)
    .put(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: noticeIdParamSchema, body: updateSafetyNoticeSchema }), updateNotice)
    .delete(authorizeProjectAccess("SAFETY_OFFICER"), validateRequest({ params: noticeIdParamSchema, body: deleteSafetyNoticeSchema }), deleteNotice);

export default router;
