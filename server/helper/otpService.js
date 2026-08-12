import dotenv from 'dotenv';

dotenv.config();

const MSG91_AUTHKEY = process.env.MSG91_AUTHKEY;
const MSG91_SENDER_ID = process.env.MSG91_SENDER_ID;

if (!MSG91_AUTHKEY || !MSG91_SENDER_ID) {
  throw new Error('Missing MSG91_AUTHKEY or MSG91_SENDER_ID in .env');
}

// Generate a 6-digit OTP.
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// MSG91 expects international format without the leading "+".
const formatPhoneNumber = (phone) => {
  const digits = String(phone).replace(/\D/g, '');

  if (digits.startsWith('91')) {
    return digits;
  }

  return `91${digits}`;
};

// Send OTP via MSG91's OTP API.
export const sendOTP = async (phone, otp) => {
  const mobile = formatPhoneNumber(phone);

  const params = new URLSearchParams({
    authkey: MSG91_AUTHKEY,
    mobile,
    message: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    sender: MSG91_SENDER_ID,
    otp,
    otp_expiry: '10',
    otp_length: '6',
  });

  const response = await fetch(
    `https://api.msg91.com/api/sendotp.php?${params.toString()}`
  );

  const rawBody = await response.text();
  let parsedBody = null;

  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    parsedBody = null;
  }

  if (
    !response.ok ||
    (parsedBody?.type && String(parsedBody.type).toLowerCase() !== 'success')
  ) {
    throw new Error(`MSG91 OTP request failed: ${rawBody}`);
  }

  console.log('OTP sent via MSG91:', rawBody);
};
