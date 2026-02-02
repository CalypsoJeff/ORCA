import express from "express";
import {
    addExercise,
    getExercises,
    getExercisesForMember,
    deleteExercise,
    getExerciseById,
    updateExercise
} from "../controllers/exerciseController.js";
import { gymOwnerAuth   } from "../middleware/gymAuth.js";
import { isLogin } from "../middleware/userAuth.js";

const router = express.Router();    

router.post("/add", gymOwnerAuth , addExercise);
router.get("/", gymOwnerAuth , getExercises);
router.get("/member", isLogin, getExercisesForMember);
router.get("/:id", gymOwnerAuth , getExerciseById);
router.put("/:id", gymOwnerAuth , updateExercise);
router.delete("/:id", gymOwnerAuth , deleteExercise);

export default router;
