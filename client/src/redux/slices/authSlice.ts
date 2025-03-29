import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    authToken: string | null,
    isAuthenticated: boolean,
    isGuest: boolean | null
    loading: boolean

}

const initialState: AuthState = {
  authToken: null,
  isAuthenticated: false,
  isGuest: null,
  loading: false
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    playAsGuest: (state, action: PayloadAction<string>) => {
        state.authToken = action.payload;
        state.isAuthenticated = true;
        state.isGuest = true;
    },
    loginUser: (state, action: PayloadAction<string>) => {
        state.authToken = action.payload;
        state.isAuthenticated = true;
        state.isGuest = false;
    },
    logout: (state) => {
      state.authToken = null;
      state.isAuthenticated = false;
      state.isGuest = null
    },
  },
});

export const { loginUser, logout, playAsGuest } = authSlice.actions;
export const authReducer = authSlice.reducer;
