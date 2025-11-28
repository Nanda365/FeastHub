import React, { useState, useEffect } from 'react';
import { Plus, Edit, Eye, TrendingUp, Clock, Star, Package } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../contexts/AuthContext';
import DishModal from '../../components/DishModal';
import { Dish } from '../../types/Dish';
import DishCard from '../../components/DishCard';
import ConfirmationModal from '../../components/ConfirmationModal';
import CuisineModal from '../../components/CuisineModal';
import ImageModal from '../../components/ImageModal';
import CustomOrderManagement from '../../components/CustomOrderManagement';
import TableManagement from '../../components/TableManagement';

interface RestaurantData {
  _id: string;
  name: string;
  address: string;
  description?: string;
  cuisine?: string[];
  imageUrl?: string;
  avgRating: number;
  numReviews: number;
  totalOrders: number;
  totalRevenue: number;
  avgPrepTime: number;
  hasRecipeBox?: boolean;
}

interface CustomOrderData {
  _id: string;
  name: string;
  user: { _id: string; name: string; email: string; phone: string; };
  defaultIngredients: string[];
  extraIngredients?: string;
  specialInstructions?: string;
  displayCode?: string;
  image?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed';
  createdAt: string;
}

interface OrderData {
  _id: string;
  user: { _id: string; name: string; email: string, phone: string; };
  orderItems: Array<{ name: string; qty: number; image: string; price: number; dish: string }>;
  basicItems?: Array<{ name: string; quantity: number; price: number; dish: string }>;
  totalPrice: number;
  orderStatus: 'pending' | 'preparing' | 'ready' | 'on-the-way' | 'delivered' | 'cancelled';
  paymentStatus: 'Paid' | 'COD' | 'Pending';
  createdAt: string;
  orderCode: string;
}

const RestaurantDashboard = () => {
  const { token, user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [restaurantData, setRestaurantData] = useState<RestaurantData | null>(null);
  const [menuItems, setMenuItems] = useState<Dish[]>([]);
  const [regularOrders, setRegularOrders] = useState<OrderData[]>([]);
  const [dashboardCustomOrders, setDashboardCustomOrders] = useState<CustomOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | undefined>(undefined);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dishToDeleteId, setDishToDeleteId] = useState<string | null>(null);
  const [isCuisineModalOpen, setIsCuisineModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [newCuisine, setNewCuisine] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [hasRecipeBox, setHasRecipeBox] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  useEffect(() => {
    if (restaurantData) {
      setHasRecipeBox(restaurantData.hasRecipeBox || false);
    }
  }, [restaurantData]);

  const fetchRestaurantData = async () => {
    if (!token || !user || user.role !== 'restaurant') {
      setLoading(false);
      setError('Authentication or role mismatch. Please log in as a restaurant owner.');
      return;
    }
    try {
      setLoading(true);
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data: restaurantProfile } = await axios.get(
        `${import.meta.env.VITE_API_URL}/restaurants/profile`,
        config
      );
      setRestaurantData(restaurantProfile);

      const { data: menu } = await axios.get(
        `${import.meta.env.VITE_API_URL}/restaurants/menu`,
        config
      );
      setMenuItems(menu);

      if (restaurantProfile?._id) {
        const { data: restaurantOrders } = await axios.get(
          `${import.meta.env.VITE_API_URL}/orders/restaurant/${restaurantProfile._id}`,
          config
        );
        const { data: customOrders } = await axios.get(
          `${import.meta.env.VITE_API_URL}/custom-orders/${restaurantProfile._id}/orders`,
          config
        );
        setRegularOrders(restaurantOrders);
        setDashboardCustomOrders(customOrders);
      }
    } catch (err: any) {
      console.error('Error fetching restaurant data:', err);
      setError(err.response?.data?.message || 'Failed to fetch restaurant data');
      toast.error(err.response?.data?.message || 'Failed to fetch restaurant data');
    } finally {
      setLoading(false);
    }
  };

  const openDishModal = (dish?: Dish) => {
    setSelectedDish(dish);
    setIsDishModalOpen(true);
  };

  const closeDishModal = () => {
    setIsDishModalOpen(false);
    setSelectedDish(undefined);
  };

  const handleSaveDish = async (dishData: any) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      if (selectedDish) {
        await axios.put(
          `${import.meta.env.VITE_API_URL}/restaurants/menu/${selectedDish._id}`,
          dishData,
          config
        );
        toast.success('Dish updated successfully!');
      } else {
        await axios.post(
          `${import.meta.env.VITE_API_URL}/restaurants/menu`,
          dishData,
          config
        );
        toast.success('Dish added successfully!');
      }
      fetchRestaurantData();
      closeDishModal();
    } catch (error: any) {
      console.error('Error saving dish:', error);
      toast.error(error.response?.data?.message || 'Failed to save dish');
    }
  };

  const handleDeleteDish = (dishId: string) => {
    setDishToDeleteId(dishId);
    setIsConfirmModalOpen(true);
  };

  const confirmDeleteDish = async () => {
    if (dishToDeleteId) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(
          `${import.meta.env.VITE_API_URL}/restaurants/menu/${dishToDeleteId}`,
          config
        );
        toast.success('Dish deleted successfully!');
        fetchRestaurantData();
        closeDishModal();
      } catch (error: any) {
        console.error('Error deleting dish:', error);
        toast.error(error.response?.data?.message || 'Failed to delete dish');
      } finally {
        setIsConfirmModalOpen(false);
        setDishToDeleteId(null);
      }
    }
  };

  const cancelDeleteDish = () => {
    setIsConfirmModalOpen(false);
    setDishToDeleteId(null);
  };

  const openCuisineModal = () => {
    setIsCuisineModalOpen(true);
    setNewCuisine(restaurantData?.cuisine?.join(', ') || '');
  };

  const closeCuisineModal = () => {
    setIsCuisineModalOpen(false);
  };

  const openImageModal = () => {
    setIsImageModalOpen(true);
    setNewImageUrl(restaurantData?.imageUrl || '');
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  const handleUpdateCuisine = async (cuisine: string) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/restaurants/profile`,
        { cuisine: cuisine.split(',').map(c => c.trim()) },
        config
      );
      toast.success('Cuisine updated successfully!');
      fetchRestaurantData();
      closeCuisineModal();
    } catch (error: any) {
      console.error('Error updating cuisine:', error);
      toast.error(error.response?.data?.message || 'Failed to update cuisine');
    }
  };

  const handleUpdateImage = async (imageUrl: string) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.put(
        `${import.meta.env.VITE_API_URL}/restaurants/profile`,
        { imageUrl: imageUrl === '' ? '' : imageUrl },
        config
      );
      toast.success('Image URL updated successfully!');
      fetchRestaurantData();
      closeImageModal();
    } catch (error: any) {
      console.error('Error updating image URL:', error);
      toast.error(error.response?.data?.message || 'Failed to update image URL');
    }
  };

  const handleToggleRecipeBox = async () => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const newRecipeBoxStatus = !hasRecipeBox;
      await axios.put(
        `${import.meta.env.VITE_API_URL}/restaurants/profile`,
        { hasRecipeBox: newRecipeBoxStatus },
        config
      );
      setHasRecipeBox(newRecipeBoxStatus);
      toast.success(`Recipe Box ${newRecipeBoxStatus ? 'enabled' : 'disabled'} successfully!`);
      fetchRestaurantData();
    } catch (error: any) {
      console.error('Error toggling Recipe Box:', error);
      toast.error(error.response?.data?.message || 'Failed to toggle Recipe Box');
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const url = `${import.meta.env.VITE_API_URL}/orders/${orderId}/status`;
      const body = { orderStatus: newStatus };
      await axios.put(url, body, config);
      toast.success('Order status updated successfully!');
      fetchRestaurantData();
    } catch (error: any) {
      console.error('Error updating order status:', error);
      toast.error(error.response?.data?.message || 'Failed to update order status');
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(regularOrders.length / ordersPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  useEffect(() => {
    fetchRestaurantData();
  }, [token, user]);

  const handleGenerateReport = async () => {
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'blob', 
      };
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_URL}/orders/report/completed`,
        config
      );
      const blob = new Blob([data], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `completed_orders_report_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Report generated and downloaded successfully!');
    } catch (error: any) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
    }
  };

  const completedOrders = regularOrders.filter(order => order.orderStatus === 'delivered');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const completedOrdersToday = completedOrders.filter(
    order => new Date(order.createdAt).setHours(0, 0, 0, 0) === today.getTime()
  );
  const totalRevenueToday = completedOrdersToday.reduce(
    (acc, order) => acc + order.orderItems.reduce((itemAcc, item) => itemAcc + (item.price * item.qty * 0.80), 0),
    0
  );

  const stats = [
    { title: 'Total Orders', value: restaurantData?.totalOrders || '15', change: '', icon: Package, color: 'bg-blue-500' },
    { title: 'Revenue Today', value: `₹${totalRevenueToday.toFixed(2)}`, change: '+80%', icon: TrendingUp, color: 'bg-green-500' },
    { title: 'Avg Rating', value: restaurantData?.avgRating || '4.5', icon: Star, color: 'bg-yellow-500' },
    { title: 'Avg Prep Time', value: `${restaurantData?.avgPrepTime || '25'} min`, change: '-2 min', icon: Clock, color: 'bg-purple-500' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'preparing': return 'bg-yellow-100 text-yellow-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'on-the-way': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center">Loading restaurant data...</div>;
  }
  if (error) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center text-red-500">Error: {error}</div>;
  }
  if (!restaurantData) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center text-gray-600">No restaurant data available. Please ensure your restaurant request is approved and linked to your account.</div>;
  }

  return (
    <div className="min-h-screen bg-background-gray">

      <ConfirmationModal
        isOpen={isConfirmModalOpen}
        onClose={cancelDeleteDish}
        onConfirm={confirmDeleteDish}
        title="Confirm Deletion"
        message="Are you sure you want to delete this dish? This action cannot be undone."
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
              Restaurant Dashboard
            </h1>
            <p className="font-inter text-gray-600">
              Manage your {restaurantData?.name || 'Restaurant'} restaurant
            </p>
          </div>
          <button
            onClick={() => openDishModal()}
            className="mt-4 lg:mt-0 bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-8">
          <div className="flex space-x-2">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'orders', label: 'Orders' },
              { id: 'menu', label: 'Menu Management' },
              { id: 'custom-orders', label: 'Custom Orders' },
              { id: 'table-management', label: 'Table Management' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'overview') {
                    fetchRestaurantData();
                  }
                }}
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

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <>
            <div className="flex flex-col lg:flex-row gap-8 mb-8">
              {/* Restaurant Info Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6 lg:w-1/3 flex items-center space-x-6">
                <img
                  src={restaurantData?.imageUrl || '/images/placeholder.jpg'}
                  alt={restaurantData?.name}
                  className="w-32 h-32 rounded-full object-cover border-4 border-orange-200"
                />
                <div className="flex-1 text-left">
                  <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-2">
                    {restaurantData?.name}
                  </h2>
                  <p className="font-inter text-gray-600 mb-2">{restaurantData?.address}</p>
                  <p className="font-inter text-gray-600 mb-4">{restaurantData?.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurantData?.cuisine && restaurantData.cuisine.length > 0 ? (
                      restaurantData.cuisine.map((c, idx) => (
                        <span key={idx} className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                          {c}
                        </span>
                      ))
                    ) : (
                      <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        No Cuisine Specified
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-4 mt-auto">
                    <button
                      onClick={openCuisineModal}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Cuisine</span>
                    </button>
                    <button
                      onClick={openImageModal}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Image</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-4">
                    <span className="font-inter text-gray-700">Enable Recipe Box</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        value=""
                        className="sr-only peer"
                        checked={hasRecipeBox}
                        onChange={handleToggleRecipeBox}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-orange-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-orange"></div>
                    </label>
                  </div>
                </div>
              </div>
              {/* Stats Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-6 lg:w-2/3">
                {stats.map((stat, index) => {
                  const IconComponent = stat.icon;
                  return (
                    <div key={index} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                          <IconComponent className="w-6 h-6 text-white" />
                        </div>
                        {stat.change && <span className={`px-3 py-1 rounded-full text-sm font-inter font-medium ${
                          stat.change.startsWith('+') || stat.change.startsWith('-2') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {stat.change}
                        </span>}
                      </div>
                      <h3 className="font-inter text-gray-600 text-sm mb-1">{stat.title}</h3>
                      <p className="font-poppins font-bold text-2xl text-accent-charcoal">{stat.value}</p>
                    </div>
                  );
                })}
              </div>
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
                      {regularOrders
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .slice(0, 5)
                        .map(order => {
                          if ('orderCode' in order) {
                            return (
                              <tr key={order._id} className="border-b border-gray-100">
                                <td className="py-4 font-inter font-medium text-accent-charcoal">{order.orderCode}</td>
                                <td className="py-4 font-inter text-gray-600">{order.user.name}</td>
                                <td className="py-4 font-inter text-gray-600">
                                  {order.orderItems && order.orderItems.length > 0
                                    ? order.orderItems.map(item => `${item.name} x${item.qty}`).join(', ')
                                    : order.basicItems && order.basicItems.length > 0
                                      ? order.basicItems.map(item => `${item.name} x${item.quantity} (Basic)`).join(', ')
                                      : 'N/A'}
                                </td>
                                <td className="py-4 font-inter font-semibold text-accent-charcoal">₹{order.totalPrice.toFixed(2)}</td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="py-4 font-inter text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                              </tr>
                            );
                          } else if (restaurantData?.hasRecipeBox && (order as CustomOrderData)) {
                            const customOrder = order as CustomOrderData;
                            return (
                              <tr key={customOrder._id} className="border-b border-gray-100">
                                <td className="py-4 font-inter font-medium text-accent-charcoal">Custom Order</td>
                                <td className="py-4 font-inter text-gray-600">{customOrder.user.name}</td>
                                <td className="py-4 font-inter text-gray-600">{customOrder.name}</td>
                                <td className="py-4 font-inter font-semibold text-accent-charcoal">-</td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(customOrder.status)}`}>
                                    {customOrder.status}
                                  </span>
                                </td>
                                <td className="py-4 font-inter text-sm text-gray-500">{new Date(customOrder.createdAt).toLocaleString()}</td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
              {/* Quick Actions omitted for brevity */}
              {/* Performance omitted for brevity */}
            </div>
          </>
        )}

        {/* Menu Management Tab */}
        {activeTab === 'menu' && (
          <>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                  Menu Management
                </h2>
                <button
                  onClick={() => openDishModal()}
                  className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transition-shadow flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Add New Dish</span>
                </button>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {menuItems.map(dish => (
                  <DishCard
                    key={dish._id}
                    dish={dish}
                    showAddButton={false}
                    restaurantName={restaurantData?.name}
                    onEdit={openDishModal}
                    onDelete={handleDeleteDish}
                  />
                ))}
              </div>
            </div>
            {/* Custom Order Management Section */}
            {restaurantData?.hasRecipeBox && (
              <CustomOrderManagement restaurantId={restaurantData._id} />
            )}
          </>
        )}

        {/* Custom Orders Tab */}
        {activeTab === 'custom-orders' && restaurantData?.hasRecipeBox && (
          <CustomOrderManagement restaurantId={restaurantData._id} />
        )}

        {/* Table Management Tab */}
        {activeTab === 'table-management' && restaurantData && (
          <TableManagement restaurantId={restaurantData._id} />
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex justify-end mb-4">
              <button
                onClick={handleGenerateReport}
                className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                Generate Completed Orders Report
              </button>
            </div>
            <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-6">
              Order Management
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Order ID</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3 pr-4">Phone No.</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Items</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Amount</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Status</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Payment Status</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Time</th>
                    <th className="text-left font-inter font-semibold text-gray-600 pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const sortedOrders = regularOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    const indexOfLastOrder = currentPage * ordersPerPage;
                    const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
                    const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
                    const totalPages = Math.ceil(regularOrders.length / ordersPerPage);

                    return (
                      <>
                        {currentOrders.map(order => {
                          if ('orderCode' in order) {
                            return (
                              <tr key={order._id} className="border-b border-gray-100">
                                <td className="py-4 font-inter font-medium text-accent-charcoal">{order.orderCode}</td>
                                <td className="py-4 font-inter text-gray-600 pr-4">{order.user.phone}</td>
                                <td className="py-4 font-inter text-gray-600">
                                  {order.orderItems && order.orderItems.length > 0
                                    ? order.orderItems.map(item => `${item.name} x${item.qty}`).join(', ')
                                    : order.basicItems && order.basicItems.length > 0
                                      ? order.basicItems.map(item => `${item.name} x${item.quantity} (Basic)`).join(', ')
                                      : 'N/A'}
                                </td>
                                <td className="py-4 font-inter font-semibold text-accent-charcoal">₹{order.totalPrice.toFixed(2)}</td>
                                <td className="py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-inter font-medium ${getStatusColor(order.orderStatus)}`}>
                                    {order.orderStatus}
                                  </span>
                                </td>
                                <td className="py-4 font-inter text-gray-600">{order.paymentStatus}</td>
                                <td className="py-4 font-inter text-sm text-gray-500">{new Date(order.createdAt).toLocaleString()}</td>
                                <td className="py-4">
                                  <select
                                    value={order.orderStatus}
                                    onChange={e => handleStatusChange(order._id, e.target.value)}
                                    className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-orange"
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="preparing">Preparing</option>
                                    <option value="ready">Ready</option>
                                    <option value="cancelled">Cancelled</option>
                                  </select>
                                </td>
                              </tr>
                            );
                          }
                          return null;
                        })}
                        <tr>
                          <td colSpan={8}>
                            <div className="flex justify-between items-center mt-4">
                              <button
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-l"
                              >
                                Previous
                              </button>
                              <div>
                                Page {currentPage} of {totalPages}
                              </div>
                              <button
                                onClick={handleNextPage}
                                disabled={currentPage === totalPages}
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

      </div>

      <DishModal
        isOpen={isDishModalOpen}
        onClose={closeDishModal}
        dish={selectedDish}
        onSave={handleSaveDish}
        onDelete={handleDeleteDish}
      />

      <CuisineModal
        isOpen={isCuisineModalOpen}
        onClose={closeCuisineModal}
        currentCuisine={restaurantData?.cuisine?.join(', ') || ''}
        onSave={handleUpdateCuisine}
        setNewCuisine={setNewCuisine}
      />

      <ImageModal
        isOpen={isImageModalOpen}
        onClose={closeImageModal}
        currentImageUrl={restaurantData?.imageUrl || ''}
        onSave={handleUpdateImage}
        setNewImageUrl={setNewImageUrl}
      />
    </div>
  );
};

export default RestaurantDashboard;
