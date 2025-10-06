import Order from "../models/orderModel.js";

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(id)
      .populate({ path: "products.product", select: "name images price" })
      .populate({ path: "address", select: "street city state country postalCode" })
      .lean();

    if (!order) return res.status(404).json({ error: "Order not found" });
    // Ensure user owns this order (if you use sessions/JWT)
    if (req.user && String(order.user) !== String(req.user._id)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    return res.json(order);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};