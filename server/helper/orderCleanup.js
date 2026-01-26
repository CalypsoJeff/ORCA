import cron from "node-cron";
import Order from "../models/orderModel.js";

export function startOrderCleanupJob() {
    cron.schedule("*/5 * * * *", async () => {
        await Order.updateMany(
            {
                status: "PendingPayment",
                "payment.status": { $ne: "PAID" },
                expiresAt: { $lte: new Date() },
            },
            { $set: { status: "Cancelled", "payment.status": "FAILED" } }
        );
    });
}
