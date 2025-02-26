import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "../api/api";

// Check if user is logged in (uses cookies)
export const checkLoginStatus = createAsyncThunk("auth/checkLoginStatus", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get("/auth/isLoggedIn", { withCredentials: true }); // Send cookies
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

// Login action
export const loginUser = createAsyncThunk("auth/loginUser", async (credentials, { rejectWithValue }) => {
  try {
    const response = await axios.post("/auth/login", credentials); // Send credentials with cookies
    return response.data;
  } catch (error) {
    return rejectWithValue(error.response.data.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: null,
    token: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkLoginStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkLoginStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
      })
      .addCase(checkLoginStatus.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data.user;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
