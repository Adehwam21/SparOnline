/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/reduxStore';
import { errorToastOptions, LoginSignUpProps, successToastOptions } from '../../types';
import axiosInstance from '../../config/axiosConfig';
import { loginFailure, loginStart, loginSuccess } from '../../redux/slices/authSlice';

const Login: React.FC<LoginSignUpProps> = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate();
  const { loading } = useSelector((state: RootState) => state.auth); // Get loading/error state

  const [formData, setFormData] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogIn = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(loginStart())
    try {
      const res = await axiosInstance.post("/auth/login", formData)

      if (res.status !== 200){
        toast.error(res.data.message, errorToastOptions)
      }

      toast.success(res.data.message, successToastOptions)
      dispatch(loginSuccess({ token: res.data.token, user: res.data.user}));
      navigate("/lobby")

    } catch (error: any) {
      dispatch(loginFailure(error))
      const errorMessage = error.response?.data?.message || "An error occurred"
      toast.error(errorMessage || "An error occured", errorToastOptions)
    } 
  
    // Reset the form after submission
    setFormData({ username: '', password: '' });
  };

  const handleGuestLogin = () => {
    localStorage.setItem('username', 'guest');
    toast.success('Logged in as Guest', successToastOptions);
    navigate('/lobby');
  };

  return (
    <div className="text-white p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleLogIn}>
        
        <label htmlFor='username'>Username</label>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your username"
            className="w-full px-3 py-2 rounded-lg bg-transparent border border-white focus:border-gold focus:outline-none"
            required
          />
        </div>

        <label htmlFor='username'>Password</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Password"
            className="w-full px-3 py-2 rounded-lg bg-transparent border border-white focus:border-gold focus:outline-none"
            required
          />
          <span
            className="absolute right-3 top-2.5 cursor-pointer"
            onClick={togglePasswordVisibility}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-yellow-500 hover:bg-yellow-400 text-gray-900 py-2 rounded-lg transition-all duration-200 mb-4"
        >
          {loading ? 'Please wait...' : 'Login'}
        </button>

        {/* OR Separator */}
        <div className="flex items-center my-4">
          <hr className="flex-grow border-white" />
          <span className="mx-2 text-white text-sm">OR</span>
          <hr className="flex-grow border-white" />
        </div>

        <button
          type="button"
          onClick={handleGuestLogin}
          className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 rounded-lg transition-all duration-200"
        >
          Continue as Guest
        </button>
      </form>
    </div>
  );
};

export default Login;
