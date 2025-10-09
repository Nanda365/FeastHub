import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { ArrowLeft, MapPin, Clock, CreditCard, Wallet, Banknote } from 'lucide-react';
import axios from 'axios';
import { initiateRazorpayPayment } from '../utils/paymentUtils';
import { useCart } from '../contexts/CartContext';

interface CheckoutForm {
  address: string;
  city: string;
  pincode: string;
  phone: string;
  paymentMethod: 'online' | 'cod';
  specialInstructions?: string;
}

const CheckoutPage = () => {
  const { items, getTotalPrice, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedBasicItems, setSelectedBasicItems] = useState<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }[]>([]);

  const basicItems = [
    { id: 'extra_sauce', name: 'Extra Sauce', price: 10 },
    { id: 'cutlery', name: 'Cutlery', price: 5 },
    { id: 'napkins', name: 'Napkins', price: 2 },
    { id: 'cool-drink', name: 'Cool Drink', price: 25 },
    { id: 'water-bottle', name: 'Water Bottle', price: 10.0 },
  ];
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, watch } = useForm<CheckoutForm>({
    defaultValues: {
      paymentMethod: 'online'
    }
  });

  const paymentMethod = watch('paymentMethod');

  const deliveryFee = 40;
  const taxRate = 0.05;
  const subtotal = getTotalPrice();
  const tax = subtotal * taxRate;
  const basicItemsTotal = (selectedBasicItems || []).reduce((sum, item) => sum + item.price, 0);
  const total = subtotal + tax + deliveryFee + basicItemsTotal;

  const onSubmit = async (data: CheckoutForm) => {
    setIsProcessing(true);

    try {
      const orderItems = items.map((item) => ({
        dish: item.dish.id,
        qty: item.quantity,
      }));

      const userInfoString = localStorage.getItem('feasthub_user');
      if (!userInfoString) {
        console.error('User not logged in. Cannot place order.');
        setIsProcessing(false);
        // Optionally, redirect to login page
        // navigate('/login');
        return;
      }
      const userInfo = JSON.parse(userInfoString);

      const orderData = {
        orderItems,
        totalPrice: total,
        basicItems: selectedBasicItems.map(item => ({ dish: item.id, quantity: item.quantity, price: item.price })),
        deliveryAddress: {
          address: data.address,
          city: data.city,
          pincode: data.pincode,
          phone: data.phone,
        },
        estimatedTime: 25, // Hardcoded for now, can be dynamic
        paymentMethod: data.paymentMethod,
      };

      if (data.paymentMethod === 'cod') {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const response = await axios.post(
          '/api/orders',
          { ...orderData, paymentStatus: 'Pending' },
          config
        );

        const { _id } = response.data;

        // Clear cart and redirect to success page
        await clearCart();
        navigate('/order-success', {
          state: {
            orderId: _id,
            total: total,
            estimatedTime: 25, // This can be dynamic from backend if needed
          },
        });
      } else if (data.paymentMethod === 'online') {
        await initiateRazorpayPayment({
          total,
          userInfo,
          orderData,
          navigate,
          clearCart,
          setIsProcessing,
        });
      }
    } catch (error) {
      console.error('Order placement failed:', error);
      // Handle error, e.g., show an error message to the user
      alert('Order placement failed. Please try again.');
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">
            No items to checkout
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
    <div className="min-h-screen bg-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/cart"
            className="text-gray-600 hover:text-primary-orange transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal">
              Checkout
            </h1>
            <p className="font-inter text-gray-600">
              Complete your healthy meal order
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Delivery Address */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary-orange" />
                  <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                    Delivery Address
                  </h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block font-inter font-medium text-accent-charcoal mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      {...register('address', { required: 'Address is required' })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                      placeholder="Enter your complete address"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-inter font-medium text-accent-charcoal mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      {...register('city', { required: 'City is required' })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block font-inter font-medium text-accent-charcoal mb-2">
                      Pincode
                    </label>
                    <input
                      type="text"
                      {...register('pincode', { 
                        required: 'Pincode is required',
                        pattern: {
                          value: /^[0-9]{6}$/,
                          message: 'Please enter a valid 6-digit pincode'
                        }
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                      placeholder="Pincode"
                    />
                    {errors.pincode && (
                      <p className="text-red-500 text-sm mt-1">{errors.pincode.message}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-inter font-medium text-accent-charcoal mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phone', { 
                        required: 'Phone number is required',
                        pattern: {
                          value: /^[0-9]{10}$/,
                          message: 'Please enter a valid 10-digit phone number'
                        }
                      })}
                      className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                      placeholder="Phone number for delivery updates"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary-orange" />
                  <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                    Payment Method
                  </h2>
                </div>

                <div className="space-y-3">
                  {[
                    { value: 'online', label: 'Online Payment', icon: CreditCard, description: 'Pay with card, UPI, or net banking' },
                    { value: 'cod', label: 'Cash on Delivery', icon: Banknote, description: 'Pay when your order arrives' }
                  ].map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <label key={method.value} className="cursor-pointer">
                        <input
                          type="radio"
                          value={method.value}
                          {...register('paymentMethod', { required: 'Please select a payment method' })}
                          className="sr-only"
                        />
                        <div className={`p-4 rounded-xl border-2 transition-all duration-300 flex items-center space-x-3 ${
                          paymentMethod === method.value
                            ? 'border-primary-orange bg-primary-orange/10'
                            : 'border-gray-200 hover:border-primary-orange/50'
                        }`}>
                          <IconComponent className="w-5 h-5 text-primary-orange" />
                          <div>
                            <div className="font-inter font-semibold text-accent-charcoal">
                              {method.label}
                            </div>
                            <div className="font-inter text-sm text-gray-600">
                              {method.description}
                            </div>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Basic Items Selection - To be implemented */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-4">
                  Add Basic Items
                </h2>
                <div className="space-y-3">
                  {basicItems.map((item) => (
                    <label key={item.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedBasicItems.some((selected) => selected.id === item.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedBasicItems((prev) => [...prev, { ...item, quantity: 1 }]);
                          } else {
                            setSelectedBasicItems((prev) =>
                              prev.filter((selected) => selected.id !== item.id)
                            );
                          }
                        }}
                        className="form-checkbox h-5 w-5 text-primary-orange rounded focus:ring-primary-orange"
                      />
                      <span className="font-inter text-accent-charcoal">
                        {item.name} - ₹{item.price}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
                <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
                  Order Summary
                </h2>

                {/* Order Items */}
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.dish.id} className="flex items-center space-x-3">
                      <img
                        src={item.dish.imageUrl}
                        alt={item.dish.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="font-inter font-medium text-sm text-accent-charcoal">
                          {item.dish.name}
                        </div>
                        <div className="font-inter text-xs text-gray-600">
                          Qty: {item.quantity} × ₹{item.dish.price}
                        </div>
                      </div>
                      <div className="font-inter font-semibold text-sm text-accent-charcoal">
                        ₹{item.dish.price * item.quantity}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Basic Items Summary */}
                {selectedBasicItems.length > 0 && (
                  <div className="space-y-2 mb-4 border-t border-gray-200 pt-4">
                    <h3 className="font-poppins font-semibold text-md text-accent-charcoal">Added Items</h3>
                    {selectedBasicItems.map((item) => (
                      <div key={item.id} className="flex justify-between font-inter text-sm">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="text-accent-charcoal">₹{item.price}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 border-t border-gray-200 pt-4">
                  <div className="flex justify-between font-inter">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-accent-charcoal">₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between font-inter">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="text-accent-charcoal">₹{deliveryFee}</span>
                  </div>
                  <div className="flex justify-between font-inter">
                    <span className="text-gray-600">Tax</span>
                    <span className="text-accent-charcoal">₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between font-poppins font-bold text-lg">
                      <span className="text-accent-charcoal">Total</span>
                      <span className="text-accent-charcoal">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Estimated Delivery */}
                <div className="bg-background-cream rounded-xl p-4 mb-6">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-primary-orange" />
                    <span className="font-inter font-semibold text-accent-charcoal">
                      Estimated Delivery
                    </span>
                  </div>
                  <p className="font-inter text-sm text-gray-600">
                    25-35 minutes from order confirmation
                  </p>
                </div>

                {/* Place Order Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full bg-gradient-teal-cyan text-white py-4 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isProcessing ? 'Processing Order...' : `Place Order - ₹${total.toFixed(2)}`}
                </button>

                {/* Security Note */}
                <p className="font-inter text-xs text-gray-500 text-center mt-4">
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;