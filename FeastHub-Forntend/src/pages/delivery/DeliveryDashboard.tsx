import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MapPin, Clock, DollarSign, Package, Navigation, Phone, Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface OrderData {
  _id: string;
  orderCode: string;
  user: { _id: string; name: string; email: string };
  restaurant: { _id: string; name: string; address: string; phone: string };
  orderItems: Array<{ name: string; qty: number; image: string; price: number; dish: string }>;
  totalPrice: number;
  orderStatus: 'pending' | 'preparing' | 'ready' | 'on-the-way' | 'delivered' | 'cancelled';
  paymentStatus: 'Paid' | 'COD' | 'Pending';
  createdAt: string;
  deliveryAddress: {
    address: string;
    city: string;
    pincode: string;
    phone: string;
  };
  estimatedTime?: number;
  deliveryPartner?: { _id: string; name: string };
}

interface DonationData {
  _id: string;
  foodItem: string;
  quantity: number;
  expirationDate: string;
  pickupLocation: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: 'pending' | 'accepted' | 'picked-up' | 'delivered';
  deliveryPartner?: { _id: string; name: string };
}

const DeliveryDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [isOnline, setIsOnline] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [deliveryOrders, setDeliveryOrders] = useState<OrderData[]>([]);
  const [donations, setDonations] = useState<DonationData[]>([]);
  const [acceptedDonations, setAcceptedDonations] = useState<string[]>([]);
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [donationsCurrentPage, setDonationsCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const activeDeliveries = deliveryOrders.filter(
    (order) => order.orderStatus === 'ready' || order.orderStatus === 'on-the-way'
  );

  const completedDeliveries = deliveryOrders.filter(
    (order) => order.orderStatus === 'delivered'
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const completedDeliveriesToday = completedDeliveries.filter(
    (order) => new Date(order.createdAt).setHours(0, 0, 0, 0) === today.getTime()
  );

  const totalEarningsToday = completedDeliveriesToday.reduce(
    (acc, order) => acc + order.orderItems.reduce((itemAcc, item) => itemAcc + (item.price * item.qty * 0.05), 0),
    0
  );

  const deliveriesCompletedToday = completedDeliveriesToday.length;

  const stats = [
    {
      title: 'Total Deliveries',
      value: deliveriesCompletedToday,
      icon: Package,
      color: 'bg-blue-500',
      change: '',
    },
    {
      title: 'Total Earnings',
      value: `₹${totalEarningsToday.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+5% Today',
    },
    {
      title: 'Avg. Delivery Time',
      value: '25 min',
      icon: Clock,
      color: 'bg-yellow-500',
      change: '25% Today',
    },
    {
      title: 'Rating',
      value: user?.deliveryRating ? user.deliveryRating.toFixed(1) : '4.6',
      icon: Star,
      color: 'bg-purple-500',
      change: user?.numDeliveryReviews ? `(${user.numDeliveryReviews} reviews)` : '',
    },
  ];

  const fetchDeliveryOrders = async () => {
    if (!user || !token || user.role !== 'delivery') {
      setDeliveryOrders([]);
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/deliverypartner`, config);
      setDeliveryOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching delivery orders:', error);
      toast.error('Failed to fetch delivery orders.');
    }
  };

  const fetchDonations = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/donations`);
      setDonations(Array.isArray(data.donations) ? data.donations : []);
    } catch (error) {
      console.error('Error fetching donations:', error);
      toast.error('Failed to fetch donations.');
    }
  };

  useEffect(() => {
    if (user && user.role === 'delivery' && user.deliveryRequestStatus !== 'approved') {
      navigate('/delivery/onboarding', { replace: true });
    }
    fetchDeliveryOrders();
    fetchDonations();
  }, [user, token, navigate]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'picked-up': return 'bg-blue-100 text-blue-800';
      case 'ready-for-pickup': return 'bg-yellow-100 text-yellow-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeliveryStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`,
        { orderStatus: newStatus },
        config
      );
      toast.success('Order status updated successfully!');
      fetchDeliveryOrders();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleHistoryNextPage = () => {
    const totalPages = Math.ceil(completedDeliveries.length / itemsPerPage);
    if (historyCurrentPage < totalPages) {
      setHistoryCurrentPage(historyCurrentPage + 1);
    }
  };

  const handleHistoryPreviousPage = () => {
    if (historyCurrentPage > 1) {
      setHistoryCurrentPage(historyCurrentPage - 1);
    }
  };

  const handleDonationsNextPage = () => {
    const totalPages = Math.ceil(donations.length / itemsPerPage);
    if (donationsCurrentPage < totalPages) {
      setDonationsCurrentPage(donationsCurrentPage + 1);
    }
  };

  const handleDonationsPreviousPage = () => {
    if (donationsCurrentPage > 1) {
      setDonationsCurrentPage(donationsCurrentPage - 1);
    }
  };

  const handleAcceptDonation = async (donationId: string) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/donations/${donationId}/accept`,
        {},
        config
      );
      toast.success('Donation accepted successfully!');
      fetchDonations();
      setAcceptedDonations([...acceptedDonations, donationId]);
    } catch (error: any) {
      console.error('Error accepting donation:', error);
      toast.error(error.response?.data?.message || 'Failed to accept donation');
    }
  };

  return (
    <div className="min-h-screen bg-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
              Delivery Dashboard
            </h1>
            <p className="font-inter text-gray-600">
              Manage your deliveries and track earnings
            </p>
          </div>

          {/* Online Status Toggle */}
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <span className="font-inter text-gray-600">Status:</span>
            <button
              onClick={() => setIsOnline(!isOnline)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isOnline ? 'bg-primary-green' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isOnline ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`font-inter font-semibold ${isOnline ? 'text-primary-green' : 'text-gray-500'}`}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard' },
              { id: 'active', label: 'Active Deliveries' },
              { id: 'history', label: 'Delivery History' },
              { id: 'donations', label: 'Donate-food' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-inter font-medium transition-all duration-300 ${
                  activeTab === tab.id
                    ? 'bg-gradient-teal-cyan text-white shadow-md'
                    : 'text-gray-600 hover:text-accent-charcoal hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${
                        stat.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                    <h3 className="font-inter text-gray-600 text-sm mb-1">{stat.title}</h3>
                    <p className="font-poppins font-bold text-2xl text-accent-charcoal">{stat.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Current Deliveries */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
                  Current Deliveries
                </h2>

                {activeDeliveries.length > 0 ? (
                  <div className="space-y-4">
                    {activeDeliveries.map((order) => (
                      <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="font-inter font-semibold text-accent-charcoal mb-1">
                              Order #{order.orderCode}
                            </div>
                            <div className="font-inter text-sm text-gray-600">
                              {order.restaurant.name} → {order.user.name}
                            </div>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(order.orderStatus)}`}>
                            {order.orderStatus.replace('-', ' ')}
                          </span>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-primary-orange" />
                            <span className="font-inter text-sm text-gray-600">{order.deliveryAddress.address}, {order.deliveryAddress.city}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-primary-orange" />
                            <span className="font-inter text-sm text-gray-600">{order.deliveryAddress.phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-poppins font-bold text-lg text-accent-charcoal">
                              ₹{order.totalPrice.toFixed(2)}
                            </span>
                            <span className="font-inter text-sm text-gray-600">
                              • {order.estimatedTime} min
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            {order.orderStatus === 'ready' && (
                              <button
                                onClick={() => handleDeliveryStatusChange(order._id, 'on-the-way')}
                                className="bg-primary-green text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-green/90 transition-colors"
                              >
                                Accept
                              </button>
                            )}
                            {order.orderStatus === 'on-the-way' && order.deliveryPartner?._id === user?._id && (
                              <>
                                <button
                                  onClick={() => {
                                    const fullAddress = `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`;
                                    const encodedAddress = encodeURIComponent(fullAddress);
                                    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                                  }}
                                  className="bg-primary-orange text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-orange/90 transition-colors flex items-center space-x-1"
                                >
                                  <Navigation className="w-4 h-4" />
                                  <span>Navigate</span>
                                </button>
                                <select
                                  value={order.orderStatus}
                                  onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                                  className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                >
                                  <option value="on-the-way">On the Way</option>
                                  <option value="delivered">Delivered</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-poppins font-semibold text-xl text-gray-600 mb-2">
                      No Active Deliveries
                    </h3>
                    <p className="font-inter text-gray-500">
                      {isOnline ? 'Waiting for new orders...' : 'Go online to receive delivery requests'}
                    </p>
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-poppins font-bold text-lg text-accent-charcoal mb-4">
                    Today's Summary
                  </h3>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Orders Delivered</span>
                      <span className="font-inter font-semibold text-accent-charcoal">12</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Distance Covered</span>
                      <span className="font-inter font-semibold text-accent-charcoal">45.2 km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Average Delivery Time</span>
                      <span className="font-inter font-semibold text-accent-charcoal">18 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Customer Rating</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-accent-yellow fill-current" />
                        <span className="font-inter font-semibold text-accent-charcoal">4.9</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-poppins font-bold text-lg text-accent-charcoal mb-4">
                    Earnings Breakdown
                  </h3>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Base Earnings</span>
                      <span className="font-inter font-semibold text-accent-charcoal">₹960</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Tips</span>
                      <span className="font-inter font-semibold text-accent-charcoal">₹180</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-gray-600">Bonus</span>
                      <span className="font-inter font-semibold text-accent-charcoal">₹110</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex items-center justify-between">
                        <span className="font-inter font-semibold text-accent-charcoal">Total</span>
                        <span className="font-poppins font-bold text-xl text-primary-green">₹1,250</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Active Deliveries Tab */}
        {activeTab === 'active' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
              Active Deliveries
            </h2>
            {/* Render same active deliveries list as dashboard tab */}
            {activeDeliveries.length > 0 ? (
              <div className="space-y-4">
                {activeDeliveries.map((order) => (
                  <div key={order._id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="font-inter font-semibold text-accent-charcoal mb-1">
                          Order #{order.orderCode}
                        </div>
                        <div className="font-inter text-sm text-gray-600">
                          {order.restaurant.name} → {order.user.name}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus.replace('-', ' ')}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-primary-orange" />
                        <span className="font-inter text-sm text-gray-600">{order.deliveryAddress.address}, {order.deliveryAddress.city}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="w-4 h-4 text-primary-orange" />
                        <span className="font-inter text-sm text-gray-600">{order.deliveryAddress.phone}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <span className="font-poppins font-bold text-lg text-accent-charcoal">
                          ₹{order.totalPrice.toFixed(2)}
                        </span>
                        <span className="font-inter text-sm text-gray-600">
                          • {order.estimatedTime} min
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {order.orderStatus === 'ready' && (
                          <button
                            onClick={() => handleDeliveryStatusChange(order._id, 'on-the-way')}
                            className="bg-primary-green text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-green/90 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                        {order.orderStatus === 'on-the-way' && order.deliveryPartner?._id === user?._id && (
                          <>
                            <button
                              onClick={() => {
                                const fullAddress = `${order.deliveryAddress.address}, ${order.deliveryAddress.city}, ${order.deliveryAddress.pincode}`;
                                const encodedAddress = encodeURIComponent(fullAddress);
                                window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
                              }}
                              className="bg-primary-orange text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-orange/90 transition-colors flex items-center space-x-1"
                            >
                              <Navigation className="w-4 h-4" />
                              <span>Navigate</span>
                            </button>
                            <select
                              value={order.orderStatus}
                              onChange={(e) => handleDeliveryStatusChange(order._id, e.target.value)}
                              className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                            >
                              <option value="on-the-way">On the Way</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-xl text-gray-600 mb-2">
                  No Active Deliveries
                </h3>
                <p className="font-inter text-gray-500">
                  {isOnline ? 'Waiting for new orders...' : 'Go online to receive delivery requests'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
              Delivery History
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Order ID</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Customer</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Amount</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Payment Status</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Time</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const indexOfLastOrder = historyCurrentPage * itemsPerPage;
                    const indexOfFirstOrder = indexOfLastOrder - itemsPerPage;
                    const currentOrders = completedDeliveries.slice(indexOfFirstOrder, indexOfLastOrder);
                    const totalPages = Math.ceil(completedDeliveries.length / itemsPerPage);

                    return (
                      <>
                        {currentOrders.map((order) => (
                          <tr key={order.orderCode} className="border-b border-gray-100">
                            <td className="py-4 font-inter font-medium text-accent-charcoal">{order.orderCode}</td>
                            <td className="py-4 font-inter text-gray-600">{order.user.name}</td>
                            <td className="py-4 font-inter font-semibold text-accent-charcoal">₹{order.totalPrice.toFixed(2)}</td>
                            <td className="py-4 font-inter text-gray-600">{order.paymentStatus}</td>
                            <td className="py-4 font-inter text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                            <td className="py-4">
                              <div className="flex items-center space-x-1">
                                <Star className="w-4 h-4 text-accent-yellow fill-current" />
                                <span className="font-inter text-sm text-accent-charcoal">4.9</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6}>
                            <div className="flex justify-between items-center mt-4">
                              <button
                                onClick={handleHistoryPreviousPage}
                                disabled={historyCurrentPage === 1}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                              >
                                Previous
                              </button>
                              <div>
                                Page {historyCurrentPage} of {totalPages}
                              </div>
                              <button
                                onClick={handleHistoryNextPage}
                                disabled={historyCurrentPage === totalPages}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                              >
                                Next
                              </button>
                            </div>
                          </td>
                        </tr>
                      </>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
              Available Donations
            </h2>
            {donations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Food Item</th>
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Quantity</th>
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Expire Date</th>
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Phone Number</th>
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Status</th>
                      <th className="text-left font-inter font-semibold text-gray-600 pb-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const indexOfLastDonation = donationsCurrentPage * itemsPerPage;
                      const indexOfFirstDonation = indexOfLastDonation - itemsPerPage;
                      const currentDonations = donations.slice(indexOfFirstDonation, indexOfLastDonation);
                      const totalPages = Math.ceil(donations.length / itemsPerPage);

                      return (
                        <>
                          {currentDonations.map((donation) => (
                            <tr key={donation._id} className="border-b border-gray-100">
                              <td className="py-4 font-inter font-medium text-accent-charcoal">{donation.foodItem}</td>
                              <td className="py-4 font-inter text-gray-600">{donation.quantity}</td>
                              <td className="py-4 font-inter text-gray-600">{new Date(donation.expirationDate).toLocaleDateString()}</td>
                              <td className="py-4 font-inter text-gray-600">{donation.contactPhone}</td>
                              <td className="py-4 font-inter text-gray-600">{donation.status}</td>
                              <td className="py-4">
                                {donation.status === 'pending' && !acceptedDonations.includes(donation._id) && (
                                  <button
                                    onClick={() => handleAcceptDonation(donation._id)}
                                    className="bg-primary-green text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-green/90 transition-colors"
                                  >
                                    Accept
                                  </button>
                                )}
                                {(donation.status === 'accepted' || acceptedDonations.includes(donation._id)) && donation.deliveryPartner?._id === user?._id && (
                                  <>
                                    <button
                                      onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(donation.pickupLocation)}`, '_blank')}
                                      className="bg-primary-orange text-white px-4 py-2 rounded-lg font-inter text-sm hover:bg-primary-orange/90 transition-colors flex items-center space-x-1 mt-2"
                                    >
                                      <Navigation className="w-4 h-4" />
                                      <span>Navigate</span>
                                    </button>
                                  </>
                                )}
                              </td>
                            </tr>
                          ))}
                          <tr>
                            <td colSpan={6}>
                              <div className="flex justify-between items-center mt-4">
                                <button
                                  onClick={handleDonationsPreviousPage}
                                  disabled={donationsCurrentPage === 1}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                                >
                                  Previous
                                </button>
                                <div>
                                  Page {donationsCurrentPage} of {totalPages}
                                </div>
                                <button
                                  onClick={handleDonationsNextPage}
                                  disabled={donationsCurrentPage === totalPages}
                                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-r"
                                >
                                  Next
                                </button>
                              </div>
                            </td>
                          </tr>
                        </>
                      );
                    })()}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="font-poppins font-semibold text-xl text-gray-600 mb-2">
                  No Donations Available
                </h3>
                <p className="font-inter text-gray-500">
                  Check back later for new donation opportunities.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryDashboard;