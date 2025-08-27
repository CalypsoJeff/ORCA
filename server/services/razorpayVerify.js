// src/services/razorpayVerify.js
import crypto from "crypto";

export function verifyCheckoutSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) return false;
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(payload)
        .digest("hex");

    try {
        const a = Buffer.from(expected, "hex");
        const b = Buffer.from(razorpay_signature, "hex");
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
        return expected === razorpay_signature;
    }
}

export function verifyWebhookSignature(rawBodyBuffer, headerSignature) {
    if (!headerSignature) return false;
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(rawBodyBuffer)
        .digest("hex");

    try {
        const a = Buffer.from(expected, "hex");
        const b = Buffer.from(headerSignature, "hex");
        return a.length === b.length && crypto.timingSafeEqual(a, b);
    } catch {
        return expected === headerSignature;
    }
}
