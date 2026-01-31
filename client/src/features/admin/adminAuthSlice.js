import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { loginAdminAPI } from "../../api/endpoints/auth/admin-auth";

export const loginAdminAsync = createAsyncThunk(
  "adminAuth/login",
  async (adminData, { rejectWithValue }) => {
    try {
      const response = await loginAdminAPI(adminData);
      const data = response.data;
      Cookies.set("token", data.token, { expires: 1 });
      Cookies.set("refreshToken", data.refreshToken, { expires: 7 });
      return {
        admin: {
          _id: data.admin?._id ?? data._id,
          name: data.admin?.name ?? data.name,
          email: data.admin?.email ?? data.email,
          isMainAdmin: data.admin?.isMainAdmin ?? data.isMainAdmin,
          status: data.admin?.status ?? data.status,
          createdAt: data.admin?.createdAt ?? data.createdAt,
          updatedAt: data.admin?.updatedAt ?? data.updatedAt,
        },
        token: data.token,
        refreshToken: data.refreshToken,
      };


    } catch (error) {
      const status = error?.status;
      const message = error?.message;

      if (
        status === 403 &&
        message === "Your account is pending approval by super admin."
      ) {
        return rejectWithValue(message);
      }

      return rejectWithValue(message || "Admin login failed. Please try again.");
    }
  }
);

const initialState = {
  admin: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const adminAuthSlice = createSlice({
  name: "adminAuth",
  initialState,
  reducers: {
    logoutAdmin(state) {
      state.admin = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      Cookies.remove("token");
      Cookies.remove("refreshToken");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAdminAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdminAsync.fulfilled, (state, action) => {
        console.log("Login fulfilled with data:", action.payload);
        state.loading = false;
        state.admin = action.payload.admin;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
      })
      .addCase(loginAdminAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { logoutAdmin } = adminAuthSlice.actions;
export const selectAdmin = (state) => state.adminAuth?.admin || null;
export default adminAuthSlice.reducer;
