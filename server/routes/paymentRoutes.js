// src/routes/paymentRoutes.js
import { Router, raw } from "express";
import { isLogin } from "../middleware/userAuth.js";
import { createOrderFromCart, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/payments/razorpay/create-order", createOrderFromCart);
router.post("/payments/razorpay/verify", verifyPayment);

export default router;
