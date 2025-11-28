import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Clock, Leaf } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, getTotalPrice, getTotalItems, clearCart } = useCart();
  const [restaurantNames, setRestaurantNames] = useState<{ [key: string]: string }>({});
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const deliveryFee = 40;
  const taxRate = 0.05;
  const subtotal = getTotalPrice();
  const discount = appliedPromo === 'HEALTHY10' ? subtotal * 0.1 : 0;
  const tax = (subtotal - discount) * taxRate;
  const total = subtotal - discount + tax + deliveryFee;

  const applyPromoCode = () => {
    if (promoCode === 'HEALTHY10') {
      setAppliedPromo(promoCode);
    }
    setPromoCode('');
  };

  const removePromoCode = () => {
    setAppliedPromo(null);
  };

  useEffect(() => {
    const fetchRestaurantNames = async () => {
      const names: { [key: string]: string } = {};
      for (const item of items) {
        if (item.dish.restaurantId && !names[item.dish.restaurantId]) {
          try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/restaurants/${item.dish.restaurantId}`);
            names[item.dish.restaurantId] = response.data.name;
          } catch (error) {
            console.error(`Error fetching restaurant ${item.dish.restaurantId}:`, error);
            names[item.dish.restaurantId] = 'Unknown Restaurant';
          }
        }
      }
      setRestaurantNames(names);
    };

    if (items.length > 0) {
      fetchRestaurantNames();
    }
  }, [items]);

  const placeOrderHandler = () => {
    navigate('/checkout');
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-16 h-16 text-gray-400" />
          </div>
          <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">
            Your cart is empty
          </h2>
          <p className="font-inter text-gray-600 mb-8">
            Looks like you haven't added any healthy dishes yet
          </p>
          {!user && (
            <div className="mt-8">
              <p className="font-inter text-gray-600 mb-4">Please log in to purchase food.</p>
              <Link
                to="/login"
                className="bg-gradient-teal-cyan text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Login
              </Link>
            </div>
          )}
          <div className="flex justify-center space-x-4">
            <Link
              to="/menu"
              className="bg-gradient-teal-cyan text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Browse Menu
            </Link>
            <Link
              to="/my-orders"
              className="bg-primary-orange text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              My Orders
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/menu"
              className="text-gray-600 hover:text-primary-orange transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="font-poppins font-bold text-3xl text-accent-charcoal">
                Your Cart
              </h1>
              <p className="font-inter text-gray-600">
                {getTotalItems()} items in your cart
              </p>
            </div>
          </div>
          <Link
            to="/my-orders"
            className="bg-primary-orange text-white px-6 py-2 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            My Orders
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-start space-x-4">
                  {/* Dish Image */}
                  <img
                    src={item.dish.imageUrl || '/images/placeholder.jpg'}
                    alt={item.dish.name}
                    className="w-20 h-20 object-cover rounded-xl"
                  />

                  {/* Dish Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-poppins font-semibold text-lg text-accent-charcoal">
                          {item.dish.name}
                        </h3>
                        <p className="font-inter text-sm text-gray-600">
                          {restaurantNames[item.dish.restaurant] || 'Loading...'}
                        </p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Nutrition Info */}
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-1">
                        <span className="font-inter text-sm text-gray-600">
                          {item.dish.nutrition?.calories} cal
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Leaf className="w-3 h-3 text-primary-green" />
                        <span className="font-inter text-sm text-gray-600">
                          {item.dish.nutrition?.protein}g protein
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="font-inter text-sm text-gray-600">
                          {item.dish.prepTime ? `${item.dish.prepTime} min` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {/* Customizations */}
                    {item.customizations && item.customizations.length > 0 && (
                      <div className="mb-3">
                        <p className="font-inter text-sm text-gray-600">
                          Customizations: {item.customizations.join(', ')}
                        </p>
                      </div>
                    )}

                    {/* Quantity and Price */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                          >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-inter font-semibold text-lg">
                          {item.quantity}
                        </span>
                        <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="w-8 h-8 bg-primary-orange text-white rounded-full flex items-center justify-center hover:bg-primary-orange/90 transition-colors"
                          >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="font-poppins font-bold text-xl text-accent-charcoal">
                        ₹{item.dish.price * item.quantity}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
                Order Summary
              </h2>

              <div className="flex justify-between font-inter text-gray-700 mb-2">
                <span>Subtotal ({getTotalItems()} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between font-inter text-green-600 mb-2">
                  <span>Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between font-inter text-gray-700 mb-2">
                <span>Tax ({taxRate * 100}%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-inter text-gray-700 mb-4">
                <span>Delivery Fee</span>
                <span>₹{deliveryFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-poppins font-bold text-xl text-accent-charcoal border-t border-gray-200 pt-4 mt-4">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>

              {/* Promo Code */}
              <div className="mb-6">
                <label className="block font-inter font-medium text-accent-charcoal mb-2">
                  Promo Code
                </label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                  />
                  <button
                    onClick={applyPromoCode}
                    className="bg-primary-orange text-white px-4 py-3 rounded-xl font-inter font-medium hover:bg-primary-orange/90 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center justify-between bg-green-50 p-2 rounded-lg">
                    <span className="font-inter text-sm text-green-700">
                      {appliedPromo} applied (10% off)
                    </span>
                    <button
                      onClick={removePromoCode}
                      className="text-green-700 hover:text-green-900"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between font-inter">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-accent-charcoal">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between font-inter">
                    <span className="text-green-600">Discount</span>
                    <span className="text-green-600">-₹{discount.toFixed(2)}</span>
                  </div>
                )}
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

              {/* Nutritional Summary */}
              <div className="bg-background-cream rounded-xl p-4 mb-6">
                <h3 className="font-inter font-semibold text-accent-charcoal mb-2">
                  Total Nutrition
                </h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center">
                    <div className="font-poppins font-bold text-primary-orange">
                      {items.reduce((total, item) => total + ((item.dish.nutrition?.calories || 0) * item.quantity), 0)}
                    </div>
                    <div className="font-inter text-gray-600">Calories</div>
                  </div>
                  <div className="text-center">
                    <div className="font-poppins font-bold text-primary-green">
                      {items.reduce((total, item) => total + ((item.dish.nutrition?.protein || 0) * item.quantity), 0)}g
                    </div>
                    <div className="font-inter text-gray-600">Protein</div>
                  </div>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={placeOrderHandler}
                className="w-full bg-gradient-teal-cyan text-white py-4 rounded-xl font-inter font-semibold text-center hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Proceed to Checkout
              </button>

              {/* Demo Promo Code */}
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                <p className="font-inter text-sm text-yellow-800">
                  💡 Try promo code: <strong>HEALTHY10</strong> for 10% off
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;