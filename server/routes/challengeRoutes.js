import express from "express";
import { createChallenge, getChallenges, deleteChallenge } from "../controllers/challengeController.js";
import { isGymOwner } from "../middleware/gymAuth.js";

const router = express.Router();

router.post("/", isGymOwner, createChallenge);
router.get("/", isGymOwner, getChallenges);
router.delete("/:id", isGymOwner, deleteChallenge);

export default router;
