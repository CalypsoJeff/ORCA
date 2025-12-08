import mongoose from "mongoose";

const tempUserSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: { type: String, unique: true },
    password: String,

    otp: String,
    otpExpiresAt: Date,

    createdAt: { type: Date, default: Date.now, expires: 600 } // auto delete after 10 min
});

export default mongoose.model("TempUser", tempUserSchema);
