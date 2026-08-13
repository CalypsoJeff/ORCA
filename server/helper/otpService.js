import dotenv from 'dotenv';

dotenv.config();

const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

if (!MSG91_AUTHKEY) {
  throw new Error('Missing MSG91_AUTHKEY in .env');
}

// Generate a 6-digit OTP.
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// MSG91 expects international format without the leading "+".
const formatPhoneNumber = (phone) => {
  const digits = String(phone).replace(/\D/g, '');

  if (digits.startsWith('91') && digits.length > 10) {
    return digits;
  }

  return `91${digits}`;
};

// Send OTP via MSG91's Flow API v5.
export const sendOTP = async (phone, otp) => {
  try {
    const mobile = formatPhoneNumber(phone);
    const templateId = process.env.MSG91_TEMPLATE_ID;

    if (!templateId) {
      throw new Error('Missing MSG91_TEMPLATE_ID in .env');
    }

    const flowUrl = 'https://control.msg91.com/api/v5/flow/';
    const flowBody = {
      template_id: templateId,
      sender: MSG91_SENDER_ID || undefined,
      recipients: [
        {
          mobiles: mobile,
          otp: otp,
          OTP: otp,
          var1: otp,
          VAR1: otp,
          var: otp,
          VAR: otp,
          code: otp,
        },
      ],
    };

    console.log("========== MSG91 OTP ==========");
    console.log("Mobile:", mobile);
    console.log("Sender:", MSG91_SENDER_ID || "N/A");
    console.log("Template ID:", templateId);
    console.log("OTP:", otp);
    console.log("URL:", flowUrl);
    console.log("================================");

    const response = await fetch(flowUrl, {
      method: 'POST',
      headers: {
        'authkey': MSG91_AUTHKEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(flowBody),
    });

    const rawBody = await response.text();

    console.log("MSG91 Flow API Status:", response.status);
    console.log("MSG91 Flow API Response:", rawBody);

    if (!response.ok) {
      throw new Error(`MSG91 HTTP ${response.status}: ${rawBody}`);
    }

    let parsedBody;
    try {
      parsedBody = JSON.parse(rawBody);
    } catch {
      parsedBody = null;
    }

    if (
      parsedBody?.type &&
      String(parsedBody.type).toLowerCase() !== "success"
    ) {
      throw new Error(`MSG91 rejected OTP: ${rawBody}`);
    }

    console.log("✅ MSG91 accepted OTP request");
    return parsedBody;
  } catch (error) {
    console.error("❌ MSG91 OTP ERROR:", error);
    throw error;
  }
};