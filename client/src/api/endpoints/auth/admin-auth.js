import END_POINTS from "../../../constants/endpoints";
import {
  adminLogin,
  adminRegister,
  adminVerifyOTP,
  approveAdminRequest,
  fetchAdminRequests,
  rejectAdminRequest,
} from "../../services/auth/admin-auth-service";

// api/endpoints/auth/admin-auth.js
export const loginAdminAPI = (userData) => {
  return adminLogin(END_POINTS.ADMIN_LOGIN, userData);
};

export const registerAdmin = (userData) => {
  return adminRegister(END_POINTS.ADMIN_REGISTER, userData);
};

export const otpVerificationAdmin = (otpData) => {
  return adminVerifyOTP(END_POINTS.ADMIN_VERIFY_OTP, otpData);
};

export const pendingAdminRequests = () => {
  return fetchAdminRequests(END_POINTS.ADMIN_PENDING_REQUESTS);
}

export const approveAdmin = (adminId) => {
  return approveAdminRequest(`${END_POINTS.APPROVE_ADMIN_REQUEST}/${adminId}`);
};

export const rejectAdmin = (adminId) => {
  return rejectAdminRequest(`${END_POINTS.REJECT_ADMIN_REQUEST}/${adminId}`);
};