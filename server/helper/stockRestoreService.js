import Product from "../models/productModel.js";

export const restoreStockForOrder = async (order, session) => {
  for (const item of order.products) {
    const qty = Number(item.quantity || 0);
    if (!qty || qty <= 0) continue;

    const productId = item.product;
    const size = item.size;
    const color = item.color;

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
      },
      {
        $inc: { "sizes.$[s].colors.$[c].stock": qty },
      },
      {
        arrayFilters: [{ "s.size": size }, { "c.color": color }],
        session,
      }
    );

    if (result.modifiedCount !== 1) {
      // This usually happens if the size/color no longer exists
      throw new Error(
        `Failed to restore stock for product=${productId} size=${size} color=${color}`
      );
    }
  }
};
