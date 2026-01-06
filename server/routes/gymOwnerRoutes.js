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
   import { gymOwnerAuth } from "../middleware/gymAuth.js";
    import { verifyAdmin } from "../middleware/adminAuth.js";

    const router = express.Router();

    // Public
    router.post("/register", registerGymOwner);
    router.post("/login", loginGymOwner);

    // Admin
    router.get("/pending", verifyAdmin, getPendingGymOwners);

    // Gym Owner (after approval)
    router.post("/members/add", gymOwnerAuth, addMember);
    router.get("/members", gymOwnerAuth, getMembers);
    router.get("/profile", gymOwnerAuth, getProfile);
    router.put("/profile", gymOwnerAuth, updateProfile);

    export default router;
