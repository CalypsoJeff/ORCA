// src/controllers/paymentController.js
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import { createRzpOrder } from "../services/razorpayService.js";
import rzp from "../services/razorpayService.js";
import {
    verifyCheckoutSignature,
    verifyWebhookSignature,
} from "../services/razorpayVerify.js";
import { finalizePaidOrder } from "../helper/orderFinalizeService.js";
export const createOrderFromCart = async (req, res) => {
    try {
        console.log("AUTH CHECK:", {
            hasUser: !!req.user,
            userIdFromReqUser: req.user?._id,
            userIdFromBody: req.body?.userId,
            headersAuth: req.headers.authorization,
        });

        const userId = req.user?._id;
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        const { addressId } = req.body;
        if (!addressId) return res.status(400).json({ error: "Missing addressId" });
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items?.length) {
            return res.status(400).json({ error: "Cart empty" });
        }
        const products = cart.items.map((i) => ({
            product: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price),
            size: i.size,
            color: i.color,
            total: Number(i.price) * Number(i.quantity),
        }));

        const subTotal = products.reduce((s, it) => s + it.total, 0);
        const grandTotalRounded = Math.round(subTotal * 100) / 100;

        const order = await Order.create({
            user: userId,
            address: addressId,
            products,
            subTotal: grandTotalRounded,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: grandTotalRounded,
            currency: "INR",

            status: "PendingPayment",
            expiresAt: new Date(Date.now() + 15 * 60 * 1000),

            payment: {
                status: "PENDING",
                gateway: "razorpay",
                notes: { userId: String(userId) },
            },
        });

        const finalPaise = Math.round(order.grandTotal * 100);

        const rzpOrder = await rzp.orders.create({
            amount: finalPaise,
            currency: "INR",
            receipt: `ord_${order._id}`,
            notes: { orderId: String(order._id) },
        });

        order.payment.razorpayOrderId = rzpOrder.id;
        order.payment.status = "PENDING";
        order.payment.receipt = rzpOrder.receipt;
        await order.save();

        return res.json({
            key: process.env.RAZORPAY_KEY_ID,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency,
            razorpayOrderId: rzpOrder.id,
            orderId: order._id,
        });
    } catch (err) {
        console.error("Order Creation Error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        const ok = verifyCheckoutSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!ok) return res.status(400).json({ status: "failure" });

        const order = await finalizePaidOrder({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            markCaptured: true,
        });

        return res.json({ status: "success", orderId: order._id });
    } catch (err) {
        console.error("verifyPayment error:", err);
        return res.status(500).json({ error: err.message });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const rawBody = req.body;

        const verified = verifyWebhookSignature(rawBody, signature);
        if (!verified) return res.status(400).send("Bad signature");

        const payload = JSON.parse(rawBody.toString("utf8"));

        if (payload.event === "payment.captured") {
            const payment = payload.payload.payment.entity;

            await finalizePaidOrder({
                razorpayOrderId: payment.order_id,
                razorpayPaymentId: payment.id,
                razorpaySignature: null,
                markCaptured: true,
            });
        }

        return res.json({ ok: true });
    } catch (err) {
        console.error("handleWebhook error:", err);
        return res.status(500).send(err.message);
    }
};

// ✅ UPDATED: callback also finalizes (still safe / no double deduct)
export const razorpayCallback = async (req, res) => {
    const frontend =
        process.env.FRONTEND_URL?.replace(/\/$/, "") || "https://orcasportsclub.in";

    console.log("🔔 RAZORPAY CALLBACK HIT");
    console.log("CONTENT-TYPE:", req.headers["content-type"]);
    console.log("REQ.BODY:", req.body);

    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            console.error("❌ Missing Razorpay fields");
            return res.redirect(`${frontend}/payment-failed`);
        }

        const ok = verifyCheckoutSignature({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        if (!ok) {
            console.error("❌ Razorpay signature verification failed");
            return res.redirect(`${frontend}/payment-failed`);
        }

        const order = await finalizePaidOrder({
            razorpayOrderId: razorpay_order_id,
            razorpayPaymentId: razorpay_payment_id,
            razorpaySignature: razorpay_signature,
            markCaptured: true,
        });

        return res.redirect(`${frontend}/order/success/${order._id}`);
    } catch (err) {
        console.error("🔥 razorpayCallback error:", err);
        return res.redirect(`${frontend}/payment-failed`);
    }
};