import mongoose from "mongoose";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import { deductStockForOrder } from "./stockService.js";

/**
 * Finalizes a Razorpay-paid order ONCE:
 * - marks payment PAID
 * - deducts stock once
 * - clears cart
 * Safe if called multiple times (idempotent).
 */
export const finalizePaidOrder = async ({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  markCaptured = false,
}) => {
  const session = await mongoose.startSession();
  try {
    let finalizedOrder = null;

    await session.withTransaction(async () => {
      const order = await Order.findOne(
        { "payment.razorpayOrderId": razorpayOrderId },
        null,
        { session }
      );

      if (!order) throw new Error("Order not found");

      // ✅ If already paid+stock done, nothing to do
      if (order.payment.status === "PAID" && order.stockDeducted) {
        finalizedOrder = order;
        return;
      }

      // ✅ Mark PAID if not already
      if (order.payment.status !== "PAID") {
        order.payment.status = "PAID";
        order.payment.razorpayPaymentId =
          razorpayPaymentId || order.payment.razorpayPaymentId;
        order.payment.razorpaySignature =
          razorpaySignature || order.payment.razorpaySignature;
        if (markCaptured) order.payment.captured = true;

        order.status = "Confirmed";
        order.expiresAt = null;
      }

      // ✅ Deduct stock only once
      if (!order.stockDeducted) {
        await deductStockForOrder(order, session);
        order.stockDeducted = true;
        order.stockDeductedAt = new Date();
      }

      await order.save({ session });

      // ✅ Clear cart
      await Cart.updateOne(
        { userId: order.user },
        { $set: { items: [], totalPrice: 0 } },
        { session }
      );

      finalizedOrder = order;
    });

    return finalizedOrder;
  } finally {
    session.endSession();
  }
};
