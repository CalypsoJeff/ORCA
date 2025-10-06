import mongoose from "mongoose";

const { Schema, model } = mongoose;

const paymentSchema = new Schema(
    {
        gateway: { type: String, enum: ["razorpay", "cod", "other"], default: "razorpay" },
        razorpayOrderId: { type: String, index: true },
        razorpayPaymentId: { type: String, index: true },
        razorpaySignature: { type: String },
        status: {
            type: String,
            enum: ["CREATED", "PENDING", "PAID", "FAILED", "REFUNDED"],
            default: "CREATED",
            index: true,
        },

        method: { type: String }, // "card", "upi", "netbanking", "wallet", "cod"
        email: { type: String },
        contact: { type: String },
        captured: { type: Boolean, default: false },
        refunds: [
            {
                amount: Number,                 // INR
                reason: String,
                razorpayRefundId: String,
                createdAt: { type: Date, default: Date.now },
            },
        ],

        notes: { type: Object },            // gateway/internal notes
        raw: { type: Object },              // last payload snapshot (optional)
    },
    { _id: false }
);

const productLineSchema = new Schema(
    {
        product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 }, // unit price (INR)
        total: { type: Number, default: 0 },             // computed: quantity * price
        size: { type: String },
        color: { type: String },
        returnStatus: {
            type: String,
            enum: ["None", "Return Requested", "Return Accepted", "Return Rejected", "Returned"],
            default: "None",
        },
    },
    { _id: false }
);

const orderSchema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
        address: { type: Schema.Types.ObjectId, ref: "Address", required: true },

        products: {
            type: [productLineSchema],
            validate: (v) => Array.isArray(v) && v.length > 0,
        },
        status: {
            type: String,
            enum: [
                "Pending",
                "Confirmed",
                "Out for Delivery",
                "Shipped",
                "Delivered",
                "Cancelled",
                "Return Requested",
                "Return Accepted",
                "Return Rejected",
            ],
            default: "Pending",
            index: true,
        },

        subTotal: { type: Number, default: 0 },
        taxTotal: { type: Number, default: 0 },
        discountTotal: { type: Number, default: 0 },
        grandTotal: { type: Number, default: 0 },
        currency: { type: String, default: "INR" },

        // Payment
        payment: { type: paymentSchema, default: () => ({}) },

        paymentMethod: { type: String, default: "razorpay" }, 
        payment_id: { type: String },                         
        payment_status: { type: Boolean, default: false },

        orderDate: { type: Date, default: Date.now },
        cancelRequest: { type: Boolean, default: false },
        reason: { type: String },
        response: { type: Boolean },

        shippedDate: { type: Date, default: null },
        deliveredDate: { type: Date, default: null },

        coupon: { type: String },
        notes: { type: Object },
    },
    { timestamps: true }
);

orderSchema.index({ "payment.status": 1, user: 1, createdAt: -1 });

orderSchema.pre("save", function preSave(next) {
    if (Array.isArray(this.products)) {
        this.products = this.products.map((it) => ({
            ...it.toObject?.() ?? it,
            total: Math.max(0, Number(it.price || 0) * Number(it.quantity || 0)),
        }));
    }

    const sub = (this.products || []).reduce((s, it) => s + (Number(it.total) || 0), 0);
    this.subTotal = Number.isFinite(sub) ? sub : 0;

    const tax = Number(this.taxTotal || 0);
    const disc = Number(this.discountTotal || 0);

    const grand = Math.max(0, this.subTotal + tax - disc);
    this.grandTotal = Number.isFinite(grand) ? grand : 0;

    next();
});

const Order = model("Order", orderSchema);
export default Order;
