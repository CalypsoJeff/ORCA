// src/routes/paymentRoutes.js
import { Router, raw } from "express";
import { isLogin } from "../middleware/userAuth.js";
import { createOrderFromCart, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

// Checkout routes (JSON body ok)
router.post("/payments/razorpay/create-order", createOrderFromCart);
router.post("/payments/razorpay/verify", verifyPayment);

// Webhook MUST use raw body and be mounted before express.json()
// router.post("/payments/razorpay/webhook", raw({ type: "application/json" }), handleWebhook);

export default router;
