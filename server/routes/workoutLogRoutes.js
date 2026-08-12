import express from "express";
import {
    createWorkoutLog,
    deleteWorkoutLog,
    getWorkoutLogById,
    getWorkoutLogs,
    updateWorkoutLog,
} from "../controllers/exerciseController.js";
import { isMember } from "../middleware/memberAuth.js";

const router = express.Router();

router.post("/", isMember, createWorkoutLog);
router.get("/", isMember, getWorkoutLogs);
router.get("/:id", isMember, getWorkoutLogById);
router.put("/:id", isMember, updateWorkoutLog);
router.delete("/:id", isMember, deleteWorkoutLog);

export default router;
