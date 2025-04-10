/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, ChangeEvent, FormEvent } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../redux/reduxStore';
import { errorToastOptions, invalidPaawordOptions, LoginSignUpProps, successToastOptions } from '../../types';
import axiosInstance from '../../config/axiosConfig';
import { registerSuccess, registerFailure, loginStart } from '../../redux/slices/authSlice';

const strongPasswordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;

const SignUp: React.FC<LoginSignUpProps> = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {loading } = useSelector((state: RootState) => state.auth); // Redux state for loading & errors

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false); // For toggling password visibility

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleRegister =  async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!strongPasswordRegex.test(formData.password)) {
      toast(
        'Password must be at least 6 characters long and include at least one letter, one number, and one special character.'
      , invalidPaawordOptions,);
      return;
    }
    
    dispatch(loginStart())
    try {
      const res = await axiosInstance.post("/auth/register", formData)

      if (res.status !== 201){
        toast.error(res.data.message, errorToastOptions)
      }

      toast.success(res.data.message, successToastOptions)
      dispatch(registerSuccess(res.data))
    

    } catch (error: any) {
      dispatch(registerFailure(error))
      const errorMessage = error.response?.data?.message || "An error occurred"
      toast.error(errorMessage || "An error occured", errorToastOptions)
    }
  
    // Reset the form after submission
    setFormData({ username: '', password: '', email: '' });
  };

  return (
    <div className="bg-transparent text-white p-6 max-w-sm mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Sign Up</h2>
      <form onSubmit={handleRegister}>
        <div className="mb-4">
          <label htmlFor='username'>Username</label>
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
        <div className="mb-4">
          <label htmlFor='username'>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full px-3 py-2 rounded-lg bg-transparent border border-white focus:border-gold focus:outline-none"
            required
          />
        </div>

        <label htmlFor='username'>Password</label>
        <div className="relative mb-6">
          <input
            type={showPassword ? 'text' : 'password'} // Toggle between text and password type
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter your password"
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
          className="w-full bg-yellow-300 hover:bg-yellow-400 text-gray-900 py-2 rounded-lg transition-all duration-200"
        >
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default SignUp;
