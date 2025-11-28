import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Building, MapPin, Phone, Mail, User as UserIcon } from 'lucide-react';

interface RestaurantOnboardingForm {
  restaurantName: string;
  restaurantAddress: string;
}

const RestaurantOnboardingPage = () => {
  const { user, token, updateUser } = useAuth();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<RestaurantOnboardingForm>();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Pre-fill user's name and phone if available
      // Note: user.name and user.phone are from AuthContext, which comes from login response
      // The backend's createRestaurantRequest will use the user's actual data from DB
    }
  }, [user, setValue]);

  const onSubmit = async (data: RestaurantOnboardingForm) => {
    setIsLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/restaurant-requests`,
        data,
        config
      );
      toast.success('Restaurant request submitted successfully!');
      updateUser({ restaurantRequestStatus: 'pending' });
    } catch (error: any) {
      console.error('Error submitting restaurant request:', error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'restaurant') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-gray">
        <p className="text-lg text-gray-700">Access Denied. This page is for restaurant partners.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
          <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6 text-center">Become a FeastHub Restaurant Partner</h1>
          <p className="font-inter text-gray-600 mb-8 text-center max-w-2xl mx-auto">
            To get started, please provide your restaurant details. Your request will be reviewed by our team.
          </p>

          {user.restaurantRequestStatus === 'pending' && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <p className="font-inter font-semibold">Your request is pending review.</p>
              <p className="font-inter text-sm">We will notify you once your request has been approved or rejected.</p>
            </div>
          )}

          {user.restaurantRequestStatus === 'rejected' && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <p className="font-inter font-semibold">Your previous request was rejected.</p>
              <p className="font-inter text-sm">{user.restaurantId || 'Please review your details and try again.'}</p>
              <button 
                onClick={() => updateUser({ restaurantRequestStatus: 'none', restaurantId: null })} 
                className="mt-2 text-sm text-red-700 underline hover:no-underline"
              >
                Submit a new request
              </button>
            </div>
          )}

          {user.restaurantRequestStatus === 'approved' && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
              <p className="font-inter font-semibold">Your restaurant request has been approved!</p>
              <p className="font-inter text-sm">You can now access your full restaurant dashboard.</p>
            </div>
          )}

          {(user.restaurantRequestStatus === 'none' || user.restaurantRequestStatus === 'rejected') && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* User Info (Pre-filled) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-inter font-medium text-accent-charcoal mb-2">Your Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.name}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed font-inter"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-inter font-medium text-accent-charcoal mb-2">Your Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed font-inter"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-inter font-medium text-accent-charcoal mb-2">Your Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={user.phone || 'N/A'}
                      readOnly
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl bg-gray-50 cursor-not-allowed font-inter"
                    />
                  </div>
                </div>
              </div>

              {/* Restaurant Details */}
              <h2 className="font-poppins font-semibold text-xl text-accent-charcoal mt-8 mb-4">Restaurant Details</h2>
              <div>
                <label htmlFor="restaurantName" className="block font-inter font-medium text-accent-charcoal mb-2">Restaurant Name</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="restaurantName"
                    {...register('restaurantName', { required: 'Restaurant name is required' })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                    placeholder="Enter your restaurant's name"
                  />
                </div>
                {errors.restaurantName && <p className="text-red-500 text-sm mt-1">{errors.restaurantName.message}</p>}
              </div>

              <div>
                <label htmlFor="restaurantAddress" className="block font-inter font-medium text-accent-charcoal mb-2">Restaurant Address</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <textarea
                    id="restaurantAddress"
                    {...register('restaurantAddress', { required: 'Restaurant address is required' })}
                    rows={3}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none transition-colors font-inter"
                    placeholder="Enter your restaurant's full address"
                  ></textarea>
                </div>
                {errors.restaurantAddress && <p className="text-red-500 text-sm mt-1">{errors.restaurantAddress.message}</p>}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Submitting Request...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default RestaurantOnboardingPage;