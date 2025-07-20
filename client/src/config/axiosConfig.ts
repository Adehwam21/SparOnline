import axios from 'axios';
import { store } from '../redux/reduxStore';

// Get API base URL from environment variables
const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: BASE_URL,
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
    if (!token) {
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
        localStorage.removeItem('token'); // Clear token if unauthorized
        window.location.href = '/'; // Redirect to login page
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
