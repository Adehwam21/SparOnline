/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, FormEvent } from 'react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { LoginSignUpProps } from '../../types';

const Login: React.FC<LoginSignUpProps> = () => {
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;
  const navigate = useNavigate();

  const [formData, setFormData] = useState<{ username: string; password: string }>({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState<boolean>(false);
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
    const { username, password } = formData;
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}auth/login`, { username, password });

      if (response.data.error) {
        toast.error(response.data.error.message);
      } else {
        const { token } = response.data.success;

        // Store the token and user details in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);

        toast.success('Login Successful.');

        // Redirect to lobby after a short delay
        setTimeout(() => {
          navigate('/lobby');
        }, 1000);

        // Reset the form
        setFormData({ username: '', password: '' });
      }
    } catch (error) {
      handleLoginError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginError = (error: any) => {
    if (axios.isAxiosError(error) && error.response) {
      const { status } = error.response;
      if (status === 404) {
        toast.error('Account does not exist. Try Signing Up');
      } else if (status === 409) {
        toast.error('Incorrect password');
      } else {
        toast.error('An error occurred on the server. Try again later.');
      }
    } else {
      toast.error('An error occurred. Check your internet connection or try again later.');
    }
  };

  const handleGuestLogin = () => {
    localStorage.setItem('username', 'guest');
    toast.success('Continuing as Guest...');
    navigate('/lobby');
  };

  return (
    <div className="text-white p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Login</h2>
      <form onSubmit={handleLogIn}>
        <div className="mb-4">
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Username"
            className="w-full px-3 py-2 rounded-lg bg-transparent border border-white focus:border-gold focus:outline-none"
            required
          />
        </div>
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
          className="w-full bg-yellow-500 hover:bg-gold text-gray-900 py-2 rounded-lg transition-all duration-200 mb-4"
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
