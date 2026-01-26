// src/routes/paymentRoutes.js
import { Router, raw } from "express";
import { isLogin } from "../middleware/userAuth.js";
import { createOrderFromCart, handleWebhook, razorpayCallback, verifyPayment } from "../controllers/paymentController.js";

const router = Router();

router.post("/payments/razorpay/create-order", createOrderFromCart);
router.post("/payments/razorpay/verify", verifyPayment);
router.post(
    "/payments/razorpay/callback",
    razorpayCallback
);
router.post(
  "/payments/razorpay/webhook",
  raw({ type: "application/json" }), // ✅ only JSON
  handleWebhook
);




export default router;
