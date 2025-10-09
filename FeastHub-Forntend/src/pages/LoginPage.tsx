import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface LoginForm {
  email: string;
  password: string;
}


const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from?.pathname || '/';

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<LoginForm>();
  const [isAdminEmail, setIsAdminEmail] = useState(false);

  const emailWatch = watch('email');

  useEffect(() => {
    if (emailWatch && emailWatch.toLowerCase() === 'admin@feasthub.com') {
      setIsAdminEmail(true);
      setValue('role', 'admin');
    } else {
      setIsAdminEmail(false);
      // Optionally reset role if email changes from admin
      // setValue('role', 'customer'); // Or null, depending on desired default
    }
  }, [emailWatch, setValue]);

  const selectedRole = watch('role');

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedInUser = await login(data.email, data.password, data.role);

      if (loggedInUser) {
        switch (loggedInUser.role) {
          case 'admin':
            navigate('/admin/dashboard', { replace: true });
            break;
          case 'restaurant':
            if (loggedInUser.restaurantRequestStatus === 'approved') {
              navigate('/restaurant/dashboard', { replace: true });
            } else {
              navigate('/restaurant/onboarding', { replace: true });
            }
            break;
          case 'delivery':
            if (loggedInUser.deliveryRequestStatus === 'approved') {
              navigate('/delivery/dashboard', { replace: true });
            } else {
              navigate('/delivery/onboarding', { replace: true });
            }
            break;
          default:
            navigate(from, { replace: true });
        }
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'An error occurred during login';
      setError(errorMessage);
      if (errorMessage.includes('verify your account')) {
        setShowVerificationLink(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const roleOptions = [
    { value: 'customer', label: 'Customer', description: 'Order healthy meals' },
    { value: 'restaurant', label: 'Restaurant Partner', description: 'Manage your restaurant' },
    { value: 'delivery', label: 'Delivery Partner', description: 'Deliver orders' },
  ];

  const [showVerificationLink, setShowVerificationLink] = useState(false);

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

        {/* Login Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-12 h-12 bg-gradient-teal-cyan rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-2xl">F</span>
              </div>
              <span className="font-poppins font-bold text-2xl text-accent-charcoal">FeastHub</span>
            </div>
            <h1 className="font-poppins font-bold text-2xl text-accent-charcoal mb-2">Welcome Back</h1>
            <p className="font-inter text-gray-600">Sign in to continue your healthy journey</p>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <span className="block sm:inline">{error}</span>
              {showVerificationLink && (
                <div className="mt-2 text-center">
                  <Link to={`/verify?email=${emailWatch}`} className="font-medium text-primary-orange hover:text-primary-orange/80">
                    Click here to verify your account
                  </Link>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {!isAdminEmail && (
              <div>
                <label className="block font-inter font-medium text-accent-charcoal mb-3">
                  I am a:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {roleOptions.map((option) => (
                    <label key={option.value} className="cursor-pointer">
                      <input
                        type="radio"
                        value={option.value}
                        {...register('role', { required: 'Please select your role' })}
                        className="sr-only"
                      />
                      <div className={`p-3 rounded-xl border-2 transition-all duration-300 ${
                        selectedRole === option.value
                          ? 'border-primary-orange bg-primary-orange/10'
                          : 'border-gray-200 hover:border-primary-orange/50'
                      }`}>
                        <div className="font-inter font-semibold text-sm text-accent-charcoal">
                          {option.label}
                        </div>
                        <div className="font-inter text-xs text-gray-600 mt-1">
                          {option.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.role && (
                  <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
                )}
              </div>
            )}

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
                      value: 6,
                      message: 'Password must be at least 6 characters'
                    }
                  })}
                  className="w-full pl-10 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                  placeholder="Enter your password"
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="font-inter text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-orange hover:text-accent-charcoal font-semibold">
                Sign Up
              </Link>
            </p>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default LoginPage;