import mongoose from "mongoose";

const tempAdminSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    otp: String,
    otpExpiresAt: Date,
    createdAt: { type: Date, default: Date.now, expires: 600 }
});

export default mongoose.model("TempAdmin", tempAdminSchema);
