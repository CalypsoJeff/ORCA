import express from "express";
import userController from "../controllers/userController.js";
import { isMember } from "../middleware/memberAuth.js";

const router = express.Router();

router.get("/", isMember, userController.getMemberChallenges);

export default router;
