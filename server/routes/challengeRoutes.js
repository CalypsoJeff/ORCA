import express from "express";
import { 
  createChallenge,
  getChallenges,
  getChallengeById,
  updateChallenge,
  deleteChallenge
} from "../controllers/challengeController.js";
import { gymOwnerAuth  } from "../middleware/gymAuth.js";

const router = express.Router();

router.post("/", gymOwnerAuth , createChallenge);
router.get("/", gymOwnerAuth , getChallenges);
router.get("/:id", gymOwnerAuth , getChallengeById);
router.patch("/:id", gymOwnerAuth , updateChallenge);
router.delete("/:id", gymOwnerAuth , deleteChallenge);

export default router;
