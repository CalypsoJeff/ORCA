import express from "express";
import {
    registerGymOwner,
    getPendingGymOwners,
    addMember,
    getMembers,
    loginGymOwner,
} from "../controllers/gymOwnerController.js";
import { isGymOwner } from "../middleware/gymAuth.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Public
router.post("/register", registerGymOwner);
router.post("/login", loginGymOwner);

// Admin
router.get("/pending", verifyAdmin, getPendingGymOwners);


// Gym Owner (after approval)
router.post("/members/add", isGymOwner, addMember);
router.get("/members", isGymOwner, getMembers);

export default router;
