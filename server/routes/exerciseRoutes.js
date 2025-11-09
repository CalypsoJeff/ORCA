import express from "express";
import { addExercise, getExercises, deleteExercise } from "../controllers/exerciseController.js";
import { isGymOwner } from "../middleware/gymAuth.js";

const router = express.Router();

router.post("/", isGymOwner, addExercise);
router.get("/", isGymOwner, getExercises);
router.delete("/:id", isGymOwner, deleteExercise);

export default router;
