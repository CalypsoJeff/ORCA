import axios from "axios";
import Cookies from "js-cookie";
import CustomApiError from "../../utils/CustomApiError";
import CONFIG_KEYS from "../../config";

const { API_BASE_URL } = CONFIG_KEYS;

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token'); 
    console.log("Token from cookies:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { data, status } = error.response;
      if (status === 400) throw new CustomApiError("Bad request", data);
      if (status === 401) throw new CustomApiError("Unauthorized", data);
      if (status === 404) throw new CustomApiError("Not Found", data);
      if (status === 409) throw new CustomApiError("Conflict", data);
      throw new CustomApiError(`Request failed with status ${status}`, data);
    } else if (error.request) {
      throw new CustomApiError(`No response received`, error.request);
    } else {
      console.log("Error:", error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
