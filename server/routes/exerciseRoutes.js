import express from "express";
import {
    addExercise,
    getExercises,
    deleteExercise,
    getExerciseById,
    updateExercise
} from "../controllers/exerciseController.js";
import { isGymOwner } from "../middleware/gymAuth.js";

const router = express.Router();

router.post("/add", isGymOwner, addExercise);
router.get("/", isGymOwner, getExercises);
router.get("/:id", isGymOwner, getExerciseById);
router.put("/:id", isGymOwner, updateExercise);
router.delete("/:id", isGymOwner, deleteExercise);

export default router;
