import express from "express";
import { isMember } from "../middleware/memberAuth.js";
import userController from "../controllers/userController.js";


const router = express.Router();
router.get("/", isMember, userController.getMemberExercises);

export default router;
