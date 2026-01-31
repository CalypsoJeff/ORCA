import Product from "../models/productModel.js";
export const deductStockForOrder = async (order, session) => {
  for (const item of order.products) {
    const qty = Number(item.quantity || 0);
    if (!qty || qty <= 0) continue;

    const productId = item.product;
    const size = item.size;
    const color = item.color;

    // Require size+color for stock tracking
    if (!size || !color) {
      throw new Error(
        `Missing size/color for product ${productId} in order ${order._id}`
      );
    }

    const result = await Product.updateOne(
      {
        _id: productId,
        "sizes.size": size,
        "sizes.colors.color": color,
        "sizes.colors.stock": { $gte: qty }, // prevent negative stock
      },
      {
        $inc: { "sizes.$[s].colors.$[c].stock": -qty },
      },
      {
        arrayFilters: [{ "s.size": size }, { "c.color": color }],
        session,
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error(
        `Insufficient stock for product=${productId} size=${size} color=${color}`
      );
    }
  }
};
