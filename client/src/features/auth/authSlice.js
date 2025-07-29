import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { loginUser, updateUserProfile } from "../../api/endpoints/auth/user-auth";
import Cookies from "js-cookie";

// Async thunk for login
export const loginAsync = createAsyncThunk("auth/login", async (userData, { rejectWithValue }) => {
  try {
    const response = await loginUser(userData);
    console.log("Login response:", response.data);
    Cookies.set("token", response.data.token);
    Cookies.set("refreshToken", response.data.refreshToken);
    return response.data;
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || "Login failed. Please try again.");
  }
});

export const updateProfileAsync = createAsyncThunk(
  "auth/updateProfile",
  async (updatedUserData, { rejectWithValue }) => {
    try {
      const response = await updateUserProfile(updatedUserData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data?.message || "Profile update failed.");
    }
  }
);

const initialState = {
  isLoggedIn: false,
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout(state) {
      state.isLoggedIn = false;
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.refreshToken = action.payload.refreshToken;
        state.error = null;
      })
      .addCase(loginAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfileAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
      })
      .addCase(updateProfileAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export const selectUser = (state) => state.auth.user;
export default authSlice.reducer;
