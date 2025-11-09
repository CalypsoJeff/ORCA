// routes/addressRoutes.js
import express from "express";
import {
    addAddress,
    getUserAddresses,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
} from "../controllers/addressController.js";

import { isLogin } from "../middleware/userAuth.js";

const router = express.Router();

router.get("/addresses", isLogin, getUserAddresses);
router.post("/add-address", isLogin, addAddress);
router.put("/update-address/:id", isLogin, updateAddress);
router.delete("/delete-address/:id", isLogin, deleteAddress);
router.patch("/set-default/:id", isLogin, setDefaultAddress);


export default router;
