// store/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

// Try to load token and user from localStorage
const token = localStorage.getItem("token");
const user = localStorage.getItem("user");

const initialState = {
  token: token || null,
  user: user ? JSON.parse(user) : null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;

      // Save to localStorage
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
    },
    logout(state) {
      state.token = null;
      state.user = null;

      // Remove from localStorage
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
