// src/controllers/paymentController.js
import Cart from "../models/cartModel.js";
import Order from "../models/orderModel.js";
import { createRzpOrder } from "../services/razorpayService.js";
import rzp from "../services/razorpayService.js";
import { verifyCheckoutSignature, verifyWebhookSignature } from "../services/razorpayVerify.js";

export const createOrderFromCart = async (req, res) => {
    try {
        const userId = req.user?._id || req.body.userId;
        if (!userId)
            return res.status(400).json({ error: "Missing user" });
        const { addressId } = req.body;
        if (!addressId)
            return res.status(400).json({ error: "Missing addressId" });

        const existingOrder = await Order.findOne({
            user: userId,
            status: { $in: ["Pending", "AwaitingPayment"] },
            "payment.gateway": "razorpay",
            "payment.status": "PENDING",
        });

        if (existingOrder?.payment?.razorpayOrderId) {
            return res.json({
                key: process.env.RAZORPAY_KEY_ID,
                amount: Math.round(existingOrder.grandTotal * 100),
                currency: existingOrder.currency || "INR",
                razorpayOrderId: existingOrder.payment.razorpayOrderId,
                orderId: existingOrder._id,
            });
        }

        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items?.length)
            return res.status(400).json({ error: "Cart empty" });

        const products = cart.items.map(i => ({
            product: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price),
            size: i.size,
            color: i.color,
            total: Number(i.price) * Number(i.quantity),
        }));

        const subTotal = products.reduce((s, it) => s + it.total, 0);

        const grandTotalRounded = Math.round(subTotal * 100) / 100;

        let order = await Order.create({
            user: userId,
            address: addressId,
            products,
            subTotal: grandTotalRounded,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: grandTotalRounded,
            currency: "INR",
            status: "Pending",
            payment: {
                status: "CREATED",
                gateway: "razorpay",
            },
        });

        order = await Order.findById(order._id);
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
        order.status = "AwaitingPayment";
        await order.save();
        console.log("KEY:", process.env.RAZORPAY_KEY_ID);
        console.log("ORDER:", rzpOrder.id);

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
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        const ok = verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature });
        if (!ok) return res.status(400).json({ status: "failure" });
        const order = await Order.findOne({ "payment.razorpayOrderId": razorpay_order_id });
        if (!order) return res.status(404).json({ error: "Order not found" });
        if (order.payment.status !== "PAID") {
            order.payment.status = "PAID";
            order.payment.razorpayPaymentId = razorpay_payment_id;
            order.payment.razorpaySignature = razorpay_signature;
            order.status = "Confirmed";
            await order.save();
            await Cart.updateOne({ userId: order.user }, { $set: { items: [], totalPrice: 0 } });
        }
        return res.json({ status: "success", orderId: order._id });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
};

export const handleWebhook = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const verified = verifyWebhookSignature(req.body, signature);
        if (!verified) return res.status(400).send("Bad signature");
        const payload = JSON.parse(req.body.toString());
        if (payload.event === "order.paid") {
            const rzpOrderId = payload.payload.order.entity.id;
            const order = await Order.findOne({ "payment.razorpayOrderId": rzpOrderId });
            if (order && order.payment.status !== "PAID") {
                order.payment.status = "PAID";
                if (order.status === "Pending") order.status = "Confirmed";
                await order.save();
            }
        }
        return res.json({ ok: true });
    } catch (err) {
        return res.status(500).send(err.message);
    }
};

// Razorpay v2 redirect callback (UX only, not source of truth)
export const razorpayCallback = async (req, res) => {
  try {
    // Razorpay sends x-www-form-urlencoded
    const body = new URLSearchParams(req.body.toString());
    const razorpayOrderId = body.get("razorpay_order_id");

    if (!razorpayOrderId) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    const order = await Order.findOne({
      "payment.razorpayOrderId": razorpayOrderId,
    });

    if (!order) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
    }

    // ⚠️ Do NOT mark PAID here
    // Webhook (payment.captured / order.paid) is the source of truth

    return res.redirect(
      `${process.env.FRONTEND_URL}/order/success/${order._id}`
    );
  } catch (err) {
    console.error("Razorpay callback error:", err);
    return res.redirect(`${process.env.FRONTEND_URL}/payment-failed`);
  }
};
