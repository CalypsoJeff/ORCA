// src/services/razorpayService.js
import Razorpay from "razorpay";
import dotenv from 'dotenv';
dotenv.config();

const rzp = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createRzpOrder({ amount, receipt, notes }) {
    // amount in INR, convert to paise
    return rzp.orders.create({
        amount: Math.round(amount * 100),
        currency: "INR",
        receipt,
        notes,
    });
}

// (Optional) expose other helpers (refunds, fetch order, etc.)
export default rzp;
