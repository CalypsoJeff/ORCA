import express from "express";
import {
    registerGymOwner,
    getPendingGymOwners,
    addMember,
    getMembers,
    loginGymOwner,
    getProfile,
    updateProfile,
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
router.get("/profile", isGymOwner, getProfile);
router.put("/profile", isGymOwner, updateProfile);

export default router;
