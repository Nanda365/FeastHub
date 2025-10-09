import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Clock, MapPin, Phone, Star } from 'lucide-react';
import axios from 'axios';

const OrderSuccessPage = () => {
  const location = useLocation();
  const { orderId: initialOrderId } = location.state || {};
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(order?.estimatedTime || 25);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!initialOrderId) {
        setError('No order ID provided.');
        setLoading(false);
        return;
      }
      try {
        const response = await axios.get(`/api/orders/${initialOrderId}`);
        setOrder(response.data);
        setTimeRemaining(response.data.estimatedTime || 25);
      } catch (err) {
        console.error('Failed to fetch order details:', err);
        setError('Failed to load order details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();

    const timer = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [initialOrderId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <p className="font-poppins text-xl text-accent-charcoal">Loading order details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <p className="font-poppins text-xl text-red-500">{error}</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">
            Order not found or invalid ID.
          </h2>
          <Link
            to="/menu"
            className="bg-gradient-teal-cyan text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            Browse Menu
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background-cream via-white to-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          {/* Success Animation */}
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-primary-green rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
              Order Placed Successfully! 🎉
            </h1>
            <p className="font-inter text-gray-600 text-lg">
              Thank you for choosing FeastHub for your healthy meal
            </p>
          </div>

          {/* Order Details Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50 mb-8">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-2">
                  Order ID
                </h3>
                <p className="font-inter text-primary-orange font-bold text-xl">
                  {order?.orderCode || 'N/A'}
                </p>
              </div>
              <div>
                <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-2">
                  Total Amount
                </h3>
                <p className="font-inter text-primary-orange font-bold text-xl">
                  ₹{order?.totalPrice?.toFixed(2) || '0.00'}
                </p>
              </div>
            </div>

            {/* Delivery Status */}
            <div className="bg-gradient-to-r from-primary-orange to-accent-yellow rounded-2xl p-6 text-white mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-inter font-semibold">Estimated Delivery</span>
                </div>
                <span className="font-poppins font-bold text-xl">
                  {timeRemaining} min
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                <div className="bg-white h-2 rounded-full w-1/4 animate-pulse"></div>
              </div>
              
              <div className="flex justify-between text-sm opacity-90">
                <span>Order Confirmed</span>
                <span>Preparing</span>
                <span>On the way</span>
                <span>Delivered</span>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-background-cream rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <MapPin className="w-4 h-4 text-primary-orange" />
                  <span className="font-inter font-semibold text-accent-charcoal">
                    Delivery Address
                  </span>
                </div>
                <p className="font-inter text-sm text-gray-600">
                  {order?.deliveryAddress?.address}, {order?.deliveryAddress?.city} - {order?.deliveryAddress?.pincode}
                </p>
              </div>

              <div className="bg-background-cream rounded-xl p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Phone className="w-4 h-4 text-primary-orange" />
                  <span className="font-inter font-semibold text-accent-charcoal">
                    Contact
                  </span>
                </div>
                <p className="font-inter text-sm text-gray-600">
                  {order?.deliveryAddress?.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Order Tracking */}
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/50 mb-8">
            <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
              Track Your Order
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-green rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-accent-charcoal">Order Confirmed</p>
                  <p className="font-inter text-sm text-gray-600">Your order has been received</p>
                </div>
                <span className="font-inter text-sm text-gray-500 ml-auto">Just now</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center animate-pulse">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-accent-charcoal">Preparing Your Meal</p>
                  <p className="font-inter text-sm text-gray-600">Our chefs are preparing your healthy meal</p>
                </div>
                <span className="font-inter text-sm text-gray-500 ml-auto">In progress</span>
              </div>

              <div className="flex items-center space-x-4 opacity-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-gray-500">Out for Delivery</p>
                  <p className="font-inter text-sm text-gray-400">Your order is on the way</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 opacity-50">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-inter font-semibold text-gray-500">Delivered</p>
                  <p className="font-inter text-sm text-gray-400">Enjoy your healthy meal!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/my-orders"
              className="flex-1 bg-gradient-teal-cyan text-white py-4 rounded-xl font-inter font-semibold text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Track Order
            </Link>
            <Link
              to="/menu"
              className="flex-1 border-2 border-primary-orange text-primary-orange py-4 rounded-xl font-inter font-semibold text-center hover:bg-primary-orange hover:text-white transition-all duration-300"
            >
              Order Again
            </Link>
          </div>

          {/* Feedback Prompt */}
          <div className="mt-8 bg-gradient-to-r from-primary-green to-accent-teal rounded-2xl p-6 text-white text-center">
            <Star className="w-8 h-8 mx-auto mb-3 opacity-90" />
            <h3 className="font-poppins font-bold text-lg mb-2">
              How was your experience?
            </h3>
            <p className="font-inter text-sm opacity-90 mb-4">
              Your feedback helps us serve you better healthy meals
            </p>
            <Link to="/profile" className="bg-white text-primary-green px-6 py-2 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center">
              Rate Your Order
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;