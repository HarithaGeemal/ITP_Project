import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    updateProfileSchema,
    idParamSchema
} from "../validations/schemas.js";
import {
    registerUser,
    loginUser,
    getUserData,
    updateMyProfile,
    getAllUsers,
    getUserById,
    updateUser,
    toggleActiveStatus,
} from "../controllers/userController.js";

const router = express.Router();

// Public — auth endpoints
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private — logged-in user's own profile
router.get("/me", protect, getUserData);
router.put("/me", protect, validateRequest({ body: updateProfileSchema }), updateMyProfile);

// Admin / PM — manage all users
router.get("/", protect, authorizeGlobalRole("ADMIN", "PROJECT_MANAGER"), getAllUsers);
router.get("/:id", protect, authorizeGlobalRole("ADMIN", "PROJECT_MANAGER"), validateRequest({ params: idParamSchema }), getUserById);
router.put("/:id", protect, authorizeGlobalRole("ADMIN", "PROJECT_MANAGER"), validateRequest({ params: idParamSchema, body: updateProfileSchema }), updateUser);
router.patch("/:id/toggle-status", protect, authorizeGlobalRole("ADMIN", "PROJECT_MANAGER"), validateRequest({ params: idParamSchema }), toggleActiveStatus);

export default router;
