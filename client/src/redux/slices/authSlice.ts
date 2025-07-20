import { AuthState } from "../../types/auth";
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const initialState: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  loading: false,
  successMessage: null,
  errorMessage: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart(state) {
      state.loading = true;
      state.errorMessage = null;
      state.successMessage = null;
    },
    loginSuccess(state, action: PayloadAction<{ token: string; user: AuthState['user']}>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.errorMessage = null;
    },

    registerSuccess(state, action: PayloadAction<{ token: string; user: AuthState['user']}>) {
      state.loading = false;
      state.isAuthenticated = true;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.errorMessage = null;
    },
    setUsername(state, action: PayloadAction<{ username: string }>) {
      if (state.user) {
        state.user.username = action.payload.username;
      }
    },
    updateBalance(state, action: PayloadAction<{ balance: number}>) {
      if (state.user) {
        state.user.balance = action.payload.balance;
      }
    },
    
    loginFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.successMessage = null;
      state.errorMessage = action.payload;
    },
    registerFailure(state, action: PayloadAction<string>) {
      state.loading = false;
      state.successMessage = null;
      state.errorMessage = action.payload;
    },
    logout(state) {
      state.isAuthenticated = false;
      state.token = null;
      state.user = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, registerSuccess, registerFailure, logout, setUsername } = authSlice.actions;
export const authReducer = authSlice.reducer;