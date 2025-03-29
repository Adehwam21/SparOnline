/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDispatch } from "../redux/reduxStore";
import { IRegisterUserInput } from "../types/auth";
import { loginFailure, loginStart, loginSuccess, registerFailure, registerSuccess } from "../redux/slices/authSlice";
import axiosInstance from "../config/axiosConfig";

export const login = (credentials: { username: string; password: string }) => async (dispatch: AppDispatch) => {
  try {
    dispatch(loginStart());

    const response = await axiosInstance.post('/auth/login', credentials);
    if (response.status !== 200){
      dispatch(loginFailure('Failed to log in'));
    } else {
      dispatch(loginSuccess({ token: response.data.token, user: response.data.user}));
    }
  } catch (error: any) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to log in'));
  }
};

export const register = (registerData: IRegisterUserInput) => async (dispatch: AppDispatch) => {
  try {
    dispatch(loginStart());

    const response = await axiosInstance.post('/auth/register', registerData);
    if (response.status !== 200){
      dispatch(registerFailure('Failed to log in'));
    } else {
      dispatch(registerSuccess({ token: response.data.token, user: response.data.user}));
    }

    dispatch(registerSuccess({ token: response.data.token, user: response.data.user}));
  } catch (error: any) {
    dispatch(loginFailure(error.response?.data?.message || 'Failed to register'));
  }
};
