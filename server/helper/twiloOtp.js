import dotenv from 'dotenv';
dotenv.config();

import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = "+1 667 249 9018"; // Your Twilio phone number

const client = twilio(accountSid, authToken);

// Generate a 6-digit OTP
export const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Format phone number to E.164 standard (i.e., +919876543210)
const formatPhoneNumber = (phone) => {
  if (!phone.startsWith("+")) {
    return `+91${phone}`; 
  }
  return phone;
};

// Send OTP via SMS
export const sendOTP = async (phone, otp) => {
  try {
    const formattedPhone = formatPhoneNumber(phone);
    console.log("Formatted phone number:", formattedPhone);

    const message = await client.messages.create({
      body: `Your OTP is ${otp}. It will expire in 10 minutes.`,
      from: twilioPhone,
      to: formattedPhone,
    });

    console.log("OTP sent:", message.sid);
  } catch (error) {
    console.error("Error sending OTP:", error);
    throw new Error("Failed to send OTP.");
  }
};
