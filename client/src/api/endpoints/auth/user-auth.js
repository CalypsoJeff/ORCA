import END_POINTS from "../../../constants/endpoints";
import { load_Addresses, login, register, resendOTP, updateUser, verifyOTP } from "../../services/auth/user-auth-service";

export const loginUser = (userData) => {
    return login(END_POINTS.LOGIN, userData);
  };

export const registerUser = (userData)=>{
    return register(END_POINTS.REGISTER,userData)
  }

  export const otpVerification = (otpData)=>{
    return verifyOTP(END_POINTS.VERIFY_OTP,otpData)
  }

  export const resendOTPVerification = (phone)=>{
    return resendOTP(END_POINTS.RESEND_OTP,phone)
  }

  export const updateUserProfile = (userData)=>{
    return updateUser(END_POINTS.UPDATE_USER,userData)
  }
  export const loadAddresses = (userId)=>{
    return load_Addresses(END_POINTS.LOAD_ADDRESSES,userId)
  }
  export const addAddress = (addressData)=>{
    return updateUser(END_POINTS.ADD_ADDRESS,addressData)
  }
  export const updateAddress = (addressData)=>{
    return updateUser(END_POINTS.UPDATE_ADDRESS,addressData)
  }
  export const deleteAddress = (addressId)=>{
    return updateUser(END_POINTS.DELETE_ADDRESS,addressId)
  }