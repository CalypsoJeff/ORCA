// testOtp.js

import dotenv from "dotenv";
dotenv.config();

import { sendOTP, generateOTP } from "./helper/otpService.js";

const phone = "9539779023";
const otp = generateOTP();

console.log("Testing OTP:", otp);

try {
  await sendOTP(phone, otp);
  console.log("✅ OTP request successful");
} catch (error) {
  console.error("❌ OTP failed:");
  console.error(error.message);
}