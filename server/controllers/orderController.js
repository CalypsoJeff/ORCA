import Order from "../models/orderModel.js";
import rzp from "../services/razorpayService.js";
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

    // ✅ Optional security check
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
  console.log("req reached here")
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "name email" })
      .lean();
    console.log(orders, "jeff")
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
      .lean();
    if (!order) return res.status(404).json({ error: "Order not found" });
    return res.json(order);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};

export const cancelOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!["Pending", "Confirmed"].includes(order.status)) {
      return res.status(400).json({
        error: "This order cannot be cancelled now.",
      });
    }

    // COD
    if (order.paymentMethod === "cod" || order.payment.gateway === "cod") {
      order.status = "Cancelled";
      order.payment.status = "REFUNDED";
      await order.save();
      return res.json({ message: "Order cancelled successfully (COD)" });
    }

    // Validate Razorpay Payment ID
    if (!order.payment.razorpayPaymentId) {
      return res.status(400).json({
        error: "Payment ID missing. Cannot process refund.",
      });
    }

    const refundAmountPaise = Math.round(order.grandTotal * 100);

    // Use rzp instance here
    const refund = await rzp.payments.refund(order.payment.razorpayPaymentId, {
      amount: refundAmountPaise,
      speed: "normal",
    });

    // Save refund details
    order.payment.refunds.push({
      amount: refund.amount / 100,
      reason: "Order Cancelled",
      razorpayRefundId: refund.id,
    });

    order.payment.status = "REFUNDED";
    order.status = "Cancelled";

    await order.save();

    return res.json({
      message: "Order cancelled and refund initiated.",
      refund,
    });

  } catch (err) {
    console.error("Refund Error:", err);
    return res.status(500).json({
      error: "Could not cancel the order. Please try again.",
    });
  }
};