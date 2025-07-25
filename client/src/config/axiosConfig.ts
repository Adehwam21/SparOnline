import axios from 'axios';
import { store } from '../redux/reduxStore';
import { logout } from '../redux/slices/authSlice';
import { API_BASE_URL } from '../constants';

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = store.getState().auth.token || localStorage.getItem("token");
    
    // If token exists, add Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response, // Simply return the response
  (error) => {
    if (error.response) {
      // Handle specific HTTP error codes (e.g., 401 Unauthorized)
      if (error.response.status === 401) {
        // Clear auth state
        store.dispatch(logout());
        localStorage.removeItem('token');
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
