import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { authorizeGlobalRole } from "../middlewares/rbacMiddleware.js";
import { validateRequest } from "../middlewares/validateRequest.js";
import {
    createMainStorageToolSchema,
    updateMainStorageToolSchema,
    createMaterialItemSchema,
    idParamSchema,
    createIssuanceLogSchema,
    returnToolIssuanceSchema,
} from "../validations/schemas.js";
import {
    createStoreMaterial,
    getStoreMaterials,
    updateStoreMaterial,
    deleteStoreMaterial,
    createStoreTool,
    getStoreTools,
    updateStoreTool,
    deleteStoreTool,
    getCombinedInventory,
} from "../controllers/mainStorageController.js";
import {
    getPendingRequests,
    getAllRequests,
    issueItem,
    denyRequest,
    getIssuanceLogs,
    updateIssuanceLog,
    deleteIssuanceLog,
    getHandedOverTools,
    returnToolIssuance,
    getMaterialIssuanceReport,
    getToolReturnReport,
} from "../controllers/issuanceController.js";

const router = express.Router();

// All store routes require authentication
router.use(protect);

// ── Combined Inventory (accessible by any authenticated user for request forms) ──
router.get("/inventory", getCombinedInventory);

// ── Store Keeper / Admin only routes below ───────────────────────────────────
const skOnly = authorizeGlobalRole("STORE_KEEPER", "ADMIN");

// Materials CRUD
router.post("/materials", skOnly, createStoreMaterial);
router.get("/materials", skOnly, getStoreMaterials);
router.put("/materials/:id", skOnly, validateRequest({ params: idParamSchema }), updateStoreMaterial);
router.delete("/materials/:id", skOnly, validateRequest({ params: idParamSchema }), deleteStoreMaterial);

// Tools CRUD
router.post("/tools", skOnly, validateRequest({ body: createMainStorageToolSchema }), createStoreTool);
router.get("/tools", skOnly, getStoreTools);
router.put("/tools/:id", skOnly, validateRequest({ params: idParamSchema }), updateStoreTool);
router.delete("/tools/:id", skOnly, validateRequest({ params: idParamSchema }), deleteStoreTool);

// Request Management
router.get("/requests", skOnly, getPendingRequests);
router.get("/all-requests", skOnly, getAllRequests);
router.post("/issue", skOnly, validateRequest({ body: createIssuanceLogSchema }), issueItem);
router.patch("/deny-request/:requestId", skOnly, denyRequest);

// Issuance Logs
router.get("/issuance-logs", skOnly, getIssuanceLogs);
router.put("/issuance-logs/:id", skOnly, validateRequest({ params: idParamSchema }), updateIssuanceLog);
router.delete("/issuance-logs/:id", skOnly, validateRequest({ params: idParamSchema }), deleteIssuanceLog);

// Tool Returns
router.get("/handed-over-tools", skOnly, getHandedOverTools);
router.patch("/return-tool/:id", skOnly, validateRequest({ params: idParamSchema, body: returnToolIssuanceSchema }), returnToolIssuance);

// Reports
router.get("/reports/materials", skOnly, getMaterialIssuanceReport);
router.get("/reports/tools", skOnly, getToolReturnReport);

export default router;
