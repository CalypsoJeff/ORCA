import CONFIG_KEYS from "../../../config";
import adminAxiosInstance from "../../middlewares/adminInterceptor";

export const adminLogin = async (endpoint, userData) => {
  const response = await adminAxiosInstance.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    userData
  );
  return response;
};

export const adminRegister = async (endpoint, userData) => {
  const response = await adminAxiosInstance.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    userData
  );
  return response;
};

export const adminVerifyOTP = async (endpoint, otpData) => {
  const response = await adminAxiosInstance.post(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
    otpData
  );
  return response;
};

// export const adminResendOTP = async (endpoint, phone) => {
//   const response = await adminAxiosInstance.post(
//     `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`,
//     { phone }
//   );
//   return response;
// };

export const fetchAdminRequests = async (endpoint) => {
  const response = await adminAxiosInstance.get(
    `${CONFIG_KEYS.API_BASE_URL}/${endpoint}`
  );
  return response;
}

export const approveAdminRequest = async (endpoint) => {
  return adminAxiosInstance.patch(`${CONFIG_KEYS.API_BASE_URL}/${endpoint}`, {
    status: "approved",
  });
};

export const rejectAdminRequest = async (endpoint) => {
  return adminAxiosInstance.patch(`${CONFIG_KEYS.API_BASE_URL}/${endpoint}`, {
    status: "rejected",
  });
};
