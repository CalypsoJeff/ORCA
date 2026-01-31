import Order from "../models/orderModel.js";
import rzp from "../services/razorpayService.js";
import { restoreStockForOrder } from "../helper/stockRestoreService.js";
import mongoose from "mongoose";

export const getAllOrders = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ error: "Unauthorized" });
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
    const { status, from, to } = req.query;
    const query = { user: userId };
    if (status) query.status = status;
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
    }
    const [items, total] = await Promise.all([
      Order.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select({
          user: 1, products: 1, status: 1, subTotal: 1, taxTotal: 1,
          discountTotal: 1, grandTotal: 1, currency: 1, payment: 1,
          createdAt: 1, orderDate: 1, address: 1,
        })
        .populate({ path: "products.product", select: "name images price" })
        .lean(),
      Order.countDocuments(query),
    ]);
    return res.json({ items, page, limit, total, hasMore: page * limit < total });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate({
        path: "products.product",
        select: "name images price",
      })
      .populate({
        path: "address", // ✅ Populate address reference
        select: "name phone addressLine1 addressLine2 city state pincode isDefault",
      })
      .lean();
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (req.user && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return res.status(200).json(order);
  } catch (e) {
    console.error("Error fetching order:", e);
    return res.status(500).json({ error: e.message });
  }
};

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "name email" })
      .lean();
    return res.json(orders);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const getOrderByIdAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id)
      .populate({ path: "user", select: "name email" })
      .populate({
        path: "products.product",
        select: "name images price brand",
      })
      .populate({
        path: "address",
        select: "name phone addressLine1 addressLine2 city state pincode",
      })
      .lean();

    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    order.status = status;
    await order.save();
    return res.json({ message: "Order status updated successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};



export const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();

  try {
    const orderId = req.params.id;

    console.log("\n===========================================");
    console.log("🔍 STARTING REFUND DEBUG");
    console.log("Order ID:", orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      console.log("❌ Order not found");
      return res.status(404).json({ error: "Order not found" });
    }

    console.log("Order Status:", order.status);

    if (!["Pending", "Confirmed"].includes(order.status)) {
      console.log("❌ Cannot cancel order at this stage");
      return res.status(400).json({
        error: "This order cannot be cancelled now.",
      });
    }

    if (!order.payment?.razorpayPaymentId) {
      console.log("❌ No Razorpay payment ID found");
      return res.status(400).json({
        error: "Payment ID missing. Cannot process refund.",
      });
    }

    console.log("Payment ID:", order.payment.razorpayPaymentId);

    // ✅ If already cancelled + refunded, return safely
    if (order.status === "Cancelled" && order.payment.status === "REFUNDED") {
      return res.json({ message: "Order already cancelled/refunded." });
    }

    // 1️⃣ Fetch Payment Details
    const paymentDetails = await rzp.payments.fetch(
      order.payment.razorpayPaymentId
    );

    // 2️⃣ Refund amount in paise (use actual captured amount)
    const refundAmountPaise = Number(paymentDetails.amount);

    console.log("\n🚀 INITIATING REFUND...");
    let refund;
    try {
      refund = await rzp.payments.refund(order.payment.razorpayPaymentId, {
        amount: refundAmountPaise,
      });
    } catch (refundErr) {
      console.log("\n❌ REFUND API ERROR (SAFE LOG):");
      console.log({
        statusCode: refundErr?.statusCode,
        error: refundErr?.error,
        message: refundErr?.message,
      });

      return res.status(500).json({
        error: "Refund API failed",
        details: refundErr?.error || refundErr?.message,
      });
    }

    console.log("\n🟢 REFUND SUCCESS:");
    console.log(JSON.stringify(refund, null, 2));

    // ✅ Now update order + restore stock atomically
    await session.withTransaction(async () => {
      const fresh = await Order.findById(orderId, null, { session });

      if (!fresh) throw new Error("Order not found in transaction");

      // ✅ restore stock ONLY if stock was deducted and not yet restored
      // (Assumes you added stockDeducted + stockRestored flags in schema)
      if (fresh.stockDeducted && !fresh.stockRestored) {
        await restoreStockForOrder(fresh, session);
        fresh.stockRestored = true;
        fresh.stockRestoredAt = new Date();
      }

      // Save refund record
      fresh.payment.refunds.push({
        amount: refund.amount / 100,
        reason: "Order Cancelled",
        razorpayRefundId: refund.id,
      });

      fresh.payment.status = "REFUNDED";
      fresh.status = "Cancelled";

      await fresh.save({ session });
    });

    console.log("✅ ORDER UPDATED SUCCESSFULLY");
    console.log("===========================================\n");

    return res.json({
      message: "Order cancelled and refund initiated.",
      refund,
    });
  } catch (err) {
    console.log("\n🔥 UNEXPECTED SERVER ERROR:");
    console.log(err);
    console.log("===========================================\n");

    return res.status(500).json({
      error: "Could not cancel order. Try again.",
      details: err.message,
    });
  } finally {
    session.endSession();
  }
};