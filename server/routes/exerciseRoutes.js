import express from "express";
import {
    addExercise,
    getExercises,
    deleteExercise,
    getExerciseById,
    updateExercise
} from "../controllers/exerciseController.js";
import { gymOwnerAuth   } from "../middleware/gymAuth.js";

const router = express.Router();

router.post("/add", gymOwnerAuth , addExercise);
router.get("/", gymOwnerAuth , getExercises);
router.get("/:id", gymOwnerAuth , getExerciseById);
router.put("/:id", gymOwnerAuth , updateExercise);
router.delete("/:id", gymOwnerAuth , deleteExercise);

export default router;
