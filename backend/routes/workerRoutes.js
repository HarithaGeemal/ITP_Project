import express from "express";
import {
    addWorker,
    getProjectWorkers,
    getWorkerById,
    updateWorker,
    deleteWorker,
} from "../controllers/workerController.js";

const router = express.Router({ mergeParams: true });

router.post("/", addWorker);
router.get("/", getProjectWorkers);
router.get("/:id", getWorkerById);
router.put("/:id", updateWorker);
router.delete("/:id", deleteWorker);

export default router;
