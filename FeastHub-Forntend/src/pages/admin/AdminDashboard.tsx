import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Store, Truck, TrendingUp, DollarSign, Package, Star, Activity, CheckCircle, XCircle, Utensils, UserCog } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import RequestModal from '../../components/RequestModal';
import ManageRestaurants from './ManageRestaurants';
import ManageDishes from './ManageDishes';
import ManageUsers from './ManageUsers';

interface RestaurantRequest {
  _id: string;
  userId: { _id: string; name: string; email: string; };
  userName: string;
  userEmail: string;
  userPhone: string;
  restaurantName: string;
  restaurantAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

interface DeliveryRequest {
  _id: string;
  userId: { _id: string; name: string; email: string; };
  userName: string;
  userEmail: string;
  userPhone: string;
  vehicleType: string;
  licensePlate: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNotes?: string;
  createdAt: string;
}

interface OrderData {
  _id: string;
  orderCode: string;
  user: { _id: string; name: string; email: string };
  restaurant: { _id: string; name: string; address: string; phone: string };
  orderItems: Array<{ name: string; qty: number; image: string; price: number; dish: string }>;
  totalPrice: number;
  orderStatus: 'pending' | 'preparing' | 'ready' | 'on-the-way' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryAddress: {
    address: string;
    city: string;
    pincode: string;
    phone: string;
  };
  estimatedTime?: number;
}

const AdminDashboard = () => {
  const { token } = useAuth();
  const [timeRange, setTimeRange] = useState('7d');
  const [restaurantRequests, setRestaurantRequests] = useState<RestaurantRequest[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<RestaurantRequest | DeliveryRequest | null>(null);
  const [requestType, setRequestType] = useState<'restaurant' | 'delivery'>('restaurant');
  const [currentRequestIndex, setCurrentRequestIndex] = useState(0);
  const [totalUsersCount, setTotalUsersCount] = useState(0);
  const [activeRestaurantsCount, setActiveRestaurantsCount] = useState(0);
  const [deliveryPartnersCount, setDeliveryPartnersCount] = useState(0);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'restaurants' | 'dishes' | 'users'>('dashboard');

  const pendingRestaurantRequests = restaurantRequests.filter(req => req.status === 'pending');
  const pendingDeliveryRequests = deliveryRequests.filter(req => req.status === 'pending');

  const fetchRequests = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data: restaurantReqs } = await axios.get(`${import.meta.env.VITE_API_URL}/users/restaurant-requests`, config);
      setRestaurantRequests(restaurantReqs);

      const { data: deliveryReqs } = await axios.get(`${import.meta.env.VITE_API_URL}/users/delivery-requests`, config);
      setDeliveryRequests(deliveryReqs);

      const { data: statsData } = await axios.get(`${import.meta.env.VITE_API_URL}/users/stats`, config);
      setTotalUsersCount(statsData.totalUsers);
      setActiveRestaurantsCount(statsData.activeRestaurants);
      setDeliveryPartnersCount(statsData.deliveryPartners);

    } catch (error: any) {
      console.error('Error fetching requests:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch requests');
    }
  };

  const fetchOrders = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/all`, config);
      setOrders(data);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch orders.');
    }
  };

  useEffect(() => {
    if (token) {
      fetchRequests();
      fetchOrders();
    }
  }, [token]);

  const handleOpenModal = (type: 'restaurant' | 'delivery') => {
    setCurrentRequestIndex(0);
    setRequestType(type);
    if (type === 'restaurant' && pendingRestaurantRequests.length > 0) {
      setSelectedRequest(pendingRestaurantRequests[0]);
      setIsModalOpen(true);
    } else if (type === 'delivery' && pendingDeliveryRequests.length > 0) {
      setSelectedRequest(pendingDeliveryRequests[0]);
      setIsModalOpen(true);
    } else {
      toast.info(`No pending ${type} requests.`);
    }
  };

  const handleNextRequest = () => {
    let nextIndex = currentRequestIndex + 1;
    if (requestType === 'restaurant') {
      if (nextIndex < pendingRestaurantRequests.length) {
        setCurrentRequestIndex(nextIndex);
        setSelectedRequest(pendingRestaurantRequests[nextIndex]);
      } else {
        handleCloseModal();
        toast.info('No more pending restaurant requests.');
      }
    } else if (requestType === 'delivery') {
      if (nextIndex < pendingDeliveryRequests.length) {
        setCurrentRequestIndex(nextIndex);
        setSelectedRequest(pendingDeliveryRequests[nextIndex]);
      } else {
        handleCloseModal();
        toast.info('No more pending delivery requests.');
      }
    }
  };

  const handlePreviousRequest = () => {
    let prevIndex = currentRequestIndex - 1;
    if (requestType === 'restaurant') {
      if (prevIndex >= 0) {
        setCurrentRequestIndex(prevIndex);
        setSelectedRequest(pendingRestaurantRequests[prevIndex]);
      } else {
        toast.info('No previous restaurant requests.');
      }
    } else if (requestType === 'delivery') {
      if (prevIndex >= 0) {
        setCurrentRequestIndex(prevIndex);
        setSelectedRequest(pendingDeliveryRequests[prevIndex]);
      } else {
        toast.info('No previous delivery requests.');
      }
    }
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleApprove = async (id: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${requestType}-requests/${id}/approve`, {}, config);
      toast.success(`${requestType === 'restaurant' ? 'Restaurant' : 'Delivery'} request approved successfully!`);
      fetchRequests();
      if ((requestType === 'restaurant' && currentRequestIndex < pendingRestaurantRequests.length - 1) ||
          (requestType === 'delivery' && currentRequestIndex < pendingDeliveryRequests.length - 1)) {
        handleNextRequest();
      } else {
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error approving request:', error);
      toast.error(error.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(`${import.meta.env.VITE_API_URL}/users/${requestType}-requests/${id}/reject`, {}, config);
      toast.error(`${requestType === 'restaurant' ? 'Restaurant' : 'Delivery'} request rejected successfully!`);
      fetchRequests();
      if ((requestType === 'restaurant' && currentRequestIndex < pendingRestaurantRequests.length - 1) ||
          (requestType === 'delivery' && currentRequestIndex < pendingDeliveryRequests.length - 1)) {
        handleNextRequest();
      } else {
        handleCloseModal();
      }
    } catch (error: any) {
      console.error('Error rejecting request:', error);
      toast.error(error.response?.data?.message || 'Failed to reject request');
    }
  };

  const completedOrders = orders.filter(
    (order) => order.orderStatus === 'delivered'
  );

  const totalAdminRevenue = completedOrders.reduce(
    (acc, order) => acc + order.orderItems.reduce((itemAcc, item) => itemAcc + (item.price * item.qty * 0.15), 0),
    0
  );

  // Updated Recent Orders logic
  const recentOrders = orders
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()) // Sort by most recent first
    .slice(0, 5) // Pick top 5 most recent orders
    .map(order => ({
      id: order.orderCode,
      customer: order.user.name,
      restaurant: order.restaurant.name,
      amount: `₹${order.totalPrice.toFixed(2)}`,
      status: order.orderStatus,
      time: new Date(order.createdAt).toLocaleString(),
    }));

  const stats = [
    { title: 'Total Users', value: totalUsersCount.toLocaleString(), change: '', icon: Users, color: 'bg-blue-500' },
    { title: 'Active Restaurants', value: activeRestaurantsCount.toLocaleString(), change: '+80%', icon: Store, color: 'bg-green-500' },
    { title: 'Delivery Partners', value: deliveryPartnersCount.toLocaleString(), change: '+05%', icon: Truck, color: 'bg-purple-500' },
    { title: 'Total Orders', value: orders.length.toLocaleString(), change: '+15%', icon: Package, color: 'bg-orange-500' },
    { title: 'Revenue', value: `₹${totalAdminRevenue.toFixed(2)}`, change: '+15%', icon: DollarSign, color: 'bg-emerald-500' },
    { title: 'Avg Rating', value: '4.8', change: '+0.2', icon: Star, color: 'bg-yellow-500' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'on-the-way': return 'bg-blue-100 text-blue-800'; // Changed from 'on-way' to 'on-the-way'
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background-gray">
      <ToastContainer />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
              Admin Dashboard
            </h1>
            <p className="font-inter text-gray-600">
              Monitor and manage your FeastHub platform
            </p>
          </div>

          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-gray-200">
          <button
            className={`px-4 py-2 font-inter font-medium ${activeTab === 'dashboard' ? 'border-b-2 border-primary-orange text-primary-orange' : 'text-gray-600 hover:text-primary-orange'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`px-4 py-2 font-inter font-medium ${activeTab === 'restaurants' ? 'border-b-2 border-primary-orange text-primary-orange' : 'text-gray-600 hover:text-primary-orange'}`}
            onClick={() => setActiveTab('restaurants')}
          >
            Restaurants
          </button>
          <button
            className={`px-4 py-2 font-inter font-medium ${activeTab === 'dishes' ? 'border-b-2 border-primary-orange text-primary-orange' : 'text-gray-600 hover:text-primary-orange'}`}
            onClick={() => setActiveTab('dishes')}
          >
            Dishes
          </button>
          <button
            className={`px-4 py-2 font-inter font-medium ${activeTab === 'users' ? 'border-b-2 border-primary-orange text-primary-orange' : 'text-gray-600 hover:text-primary-orange'}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </div>

        {/* Conditional Rendering of Content */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {stats.map((stat, index) => {
                const IconComponent = stat.icon;
                const isClickable = stat.title === 'Active Restaurants' || stat.title === 'Delivery Partners';
                const linkPath = stat.title === 'Active Restaurants' ? '/admin/restaurants' : stat.title === 'Delivery Partners' ? '/admin/delivery-partners' : '#';

                const content = (
                  <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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

                return isClickable ? <Link to={linkPath} key={index}>{content}</Link> : <div key={index}>{content}</div>;
              })}
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Recent Orders */}
                  <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                        Recent Orders
                      </h2>
                      <div className="flex space-x-4">
                        <button className="text-primary-orange hover:text-accent-charcoal font-inter font-semibold">
                          View All
                        </button>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200">
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Order ID</th>
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Customer</th>
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Items</th>
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Amount</th>
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Status</th>
                            <th className="text-left font-inter font-semibold text-gray-600 pb-3">Time</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders
                            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                            .slice(0, 5)
                            .map((order) => (
                              <tr key={order._id} className="border-b border-gray-100">
                                <td className="py-4 font-inter font-medium text-accent-charcoal">{order.orderCode}</td>
                                <td className="py-4 font-inter text-gray-600">{order.user.name}</td>
                                <td className="py-4 font-inter text-gray-600">{order.orderItems.map(item => `${item.name} x${item.qty}`).join(', ')}</td>
                                <td className="py-4 font-inter font-semibold text-accent-charcoal">₹{order.totalPrice.toFixed(2)}</td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="py-4 font-inter text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                {/* System Health */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="w-5 h-5 text-primary-green" />
                    <h3 className="font-poppins font-bold text-lg text-accent-charcoal">
                      System Health
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-gray-600">Server Status</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-inter">Online</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-gray-600">Database</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-inter">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-gray-600">Payment Gateway</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-inter">Active</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-inter text-sm text-gray-600">Delivery API</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-inter">Slow</span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-poppins font-bold text-lg text-accent-charcoal mb-4">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => handleOpenModal('restaurant')}
                      className="w-full bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                      disabled={pendingRestaurantRequests.length === 0}
                    >
                      Approve Restaurant ({pendingRestaurantRequests.length})
                    </button>
                    <button
                      onClick={() => handleOpenModal('delivery')}
                      className="w-full bg-primary-green text-white py-3 rounded-xl font-inter font-medium hover:shadow-lg transition-shadow disabled:opacity-50"
                      disabled={pendingDeliveryRequests.length === 0}
                    >
                      Verify Delivery Partner ({pendingDeliveryRequests.length})
                    </button>
                    <button className="w-full border-2 border-primary-orange text-primary-orange py-3 rounded-xl font-inter font-medium hover:bg-primary-orange hover:text-white transition-colors">
                      Generate Report
                    </button>
                  </div>
                </div>

                {/* Top Performing */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="font-poppins font-bold text-lg text-accent-charcoal mb-4">
                    Top Performing
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm text-gray-600">Green Kitchen</span>
                        <span className="font-inter text-sm font-semibold text-accent-charcoal">₹45,230</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-green h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm text-gray-600">Ocean Fresh</span>
                        <span className="font-inter text-sm font-semibold text-accent-charcoal">₹38,920</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-primary-orange h-2 rounded-full w-3/5"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-inter text-sm text-gray-600">FitBite Express</span>
                        <span className="font-inter text-sm font-semibold text-accent-charcoal">₹32,150</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-accent-teal h-2 rounded-full w-2/5"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'restaurants' && <ManageRestaurants />}

        {activeTab === 'dishes' && <ManageDishes />}

        {activeTab === 'users' && <ManageUsers />}
      </div>
      {isModalOpen && selectedRequest && (
        <RequestModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          request={selectedRequest}
          onApprove={handleApprove}
          onReject={handleReject}
          requestType={requestType}
          onNext={handleNextRequest}
          hasMoreRequests={
            requestType === 'restaurant'
              ? currentRequestIndex < pendingRestaurantRequests.length - 1
              : currentRequestIndex < pendingDeliveryRequests.length - 1
          }
          onPrevious={handlePreviousRequest}
          hasPreviousRequests={currentRequestIndex > 0}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
