/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppDispatch, store } from "../redux/reduxStore";
import { IRegisterUserInput } from "../types/auth";
import { loginFailure, loginStart, loginSuccess, registerFailure, registerSuccess, updateBalance } from "../redux/slices/authSlice";
import axiosInstance from "../config/axiosConfig";
import toast from "react-hot-toast";
import { errorToastOptions } from "../types";

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

export const fetchUpdatedUserBalance = async () => {
  try {
    const response = await axiosInstance.get('/user/profile');

    if (response.status !== 200) {
      toast.error('Failed to fetch user profile', errorToastOptions);
      throw new Error('Failed to fetch profile');
    }

    const data = response.data;
    if (!data.profile || typeof data.profile.balance !== 'number') return;
    const balance = data.profile.balance
    store.dispatch(updateBalance({balance}));
    
  } catch (error) {
    console.error("Error fetching user profile: ", error);
  }
};
