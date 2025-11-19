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

        // Fetch cart
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items?.length)
            return res.status(400).json({ error: "Cart empty" });

        // Build products list
        const products = cart.items.map(i => ({
            product: i.productId,
            quantity: Number(i.quantity),
            price: Number(i.price),
            size: i.size,
            color: i.color,
            total: Number(i.price) * Number(i.quantity),
        }));

        // Safe subtotal
        const subTotal = products.reduce((s, it) => s + it.total, 0);

        // IMPORTANT: round to 2 decimals (₹ format)
        const grandTotalRounded = Math.round(subTotal * 100) / 100;

        // Convert to paise (always integer)
        const totalPaise = Math.round(grandTotalRounded * 100);

        // 1️⃣ Create order FIRST so mongoose pre-save can normalize data
        let order = await Order.create({
            user: userId,
            address: addressId,
            products,
            subTotal: grandTotalRounded,
            taxTotal: 0,
            discountTotal: 0,
            grandTotal: grandTotalRounded, // safe 2-dec float
            currency: "INR",
            status: "Pending",
            payment: { status: "CREATED", gateway: "razorpay" },
        });

        // 2️⃣ Reload order AFTER pre-save updates totals
        order = await Order.findById(order._id);

        // 3️⃣ Convert final DB grandTotal to paise
        const finalPaise = Math.round(order.grandTotal * 100);

        // 4️⃣ Create Razorpay Order EXACTLY matching paise amount
        const rzpOrder = await rzp.orders.create({
            amount: finalPaise,      // paise integer (required!)
            currency: "INR",
            receipt: `ord_${order._id}`,
            notes: { orderId: String(order._id) },
        });

        // 5️⃣ Save RZP order details
        order.payment.razorpayOrderId = rzpOrder.id;
        order.payment.status = "PENDING";
        await order.save();

        // 6️⃣ Send response to frontend
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
