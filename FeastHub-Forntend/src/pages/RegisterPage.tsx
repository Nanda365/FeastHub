import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'customer' | 'restaurant' | 'delivery';
  agreeToTerms: boolean;
}

const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<RegisterForm>({
    defaultValues: {
      role: 'customer'
    }
  });

  const selectedRole = watch('role');
  const password = watch('password');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/users/register`, data);
      setIsLoading(false);
      navigate('/verify', { state: { email: data.email } });
    } catch (error: any) {
      setIsLoading(false);
      setError(error.response?.data?.message || 'An error occurred');
    }
  };

  const roleOptions = [
    { value: 'customer', label: 'Customer', description: 'Order healthy meals', icon: '🍽️' },
    { value: 'restaurant', label: 'Restaurant Partner', description: 'List your restaurant', icon: '🏪' },
    { value: 'delivery', label: 'Delivery Partner', description: 'Become a delivery partner', icon: '🚴' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-cream via-white to-background-gray flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Button */}
        <Link 
          to="/"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-primary-orange transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-inter">Back to Home</span>
        </Link>

        {/* Register Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <span className="font-poppins font-bold text-2xl text-accent-charcoal">FeastHub</span>
            </div>
            <h1 className="font-poppins font-bold text-2xl text-accent-charcoal mb-2">Join FeastHub</h1>
            <p className="font-inter text-gray-600">Start your healthy eating journey today</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Role Selection */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-3">
                I want to:
              </label>
              <div className="space-y-3">
                {roleOptions.map((option) => (
                  <label key={option.value} className="cursor-pointer">
                    <input
                      type="radio"
                      value={option.value}
                      {...register('role', { required: 'Please select your role' })}
                      className="sr-only"
                    />
                    <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                      selectedRole === option.value
                        ? 'border-primary-orange bg-primary-orange/10'
                        : 'border-gray-200 hover:border-primary-orange/50'
                    }`}>
                      <span className="text-2xl">{option.icon}</span>
                      <div>
                        <div className="font-inter font-semibold text-accent-charcoal">
                          {option.label}
                        </div>
                        <div className="font-inter text-sm text-gray-600">
                          {option.description}
                        </div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Name Field */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Enter your full name"
                />
              </div>
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone number is required',
                    pattern: {
                      value: /^[0-9]{10}$/,
                      message: 'Please enter a valid 10-digit phone number'
                    }
                  })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Enter your phone number"
                />
              </div>
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 8,
                      message: 'Password must be at least 8 characters'
                    },
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                      message: 'Password must contain uppercase, lowercase, and number'
                    }
                  })}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Create a strong password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: value => value === password || 'Passwords do not match'
                  })}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                {...register('agreeToTerms', {
                  required: 'You must agree to the terms and conditions'
                })}
                className="mt-1 w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
              />
              <label className="font-inter text-sm text-gray-600">
                I agree to the{' '}
                <Link to="/terms" className="text-primary-orange hover:text-accent-charcoal">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-primary-orange hover:text-accent-charcoal">
                  Privacy Policy
                </Link>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-red-500 text-sm">{errors.agreeToTerms.message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="font-inter text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-orange hover:text-accent-charcoal font-semibold">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;