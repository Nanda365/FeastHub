import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { User as UserIcon, Mail, Phone, Edit, Save, ShoppingBag } from 'lucide-react';

interface ProfileForm {
  name: string;
  email: string;
  phone: string;
}

interface RegularOrder {
  _id: string;
  orderCode: string;
  totalPrice: number;
  createdAt: string;
  orderItems: Array<{ name: string; qty: number; image: string; price: number; dish: string }>;
  orderStatus: string;
  paymentStatus: string;
}

interface ParentOrder {
  _id: string;
  orderCode: string; // Parent order also has an order code
  totalPrice: number;
  createdAt: string;
  orders: RegularOrder[]; // This is the key change: array of RegularOrders
  deliveryRating?: number; // Added in previous step
  paymentStatus: string; // Assuming parent order also has this
}

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();
  const [orders, setOrders] = useState<ParentOrder[]>([]); // Changed type to ParentOrder[]
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileForm>();

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('email', user.email);
      setValue('phone', user.phone || ''); 
    }

    const fetchOrders = async () => {
      if (!user || !token) return;
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders`, config);
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to fetch orders.');
      }
    };

    fetchOrders();
  }, [user, setValue, token]);

  const onSubmit = async (data: ProfileForm) => {
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data: updatedUserData } = await axios.put(
        `${import.meta.env.VITE_API_URL}/users/profile`,
        data,
        config
      );
      updateUser(updatedUserData);
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-gray">
        <p className="text-lg text-gray-700">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 lg:p-10">
          <div className="flex justify-between items-center mb-6">
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal">My Profile</h1>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-orange text-white rounded-full hover:bg-primary-orange/90 transition-colors"
            >
              {isEditing ? <Save className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
              <span>{isEditing ? 'Save' : 'Edit Profile'}</span>
            </button>
          </div>

          {/* Profile Information */}
          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4">
              <UserIcon className="w-6 h-6 text-primary-orange" />
              <div>
                <p className="text-gray-600 text-sm">Full Name</p>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('name', { required: 'Full Name is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                ) : (
                  <p className="font-inter font-semibold text-lg text-accent-charcoal">{user.name}</p>
                )}
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Mail className="w-6 h-6 text-primary-orange" />
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                {isEditing ? (
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                ) : (
                  <p className="font-inter font-semibold text-lg text-accent-charcoal">{user.email}</p>
                )}
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Phone className="w-6 h-6 text-primary-orange" />
              <div>
                <p className="text-gray-600 text-sm">Phone</p>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('phone')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                ) : (
                  <p className="font-inter font-semibold text-lg text-accent-charcoal">{user.phone || 'N/A'}</p>
                )}
              </div>
            </div>

            {user.role === 'restaurant' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600 text-sm">Restaurant Request Status</p>
                  <p className="font-inter font-semibold text-lg text-accent-charcoal">{user.restaurantRequestStatus || 'N/A'}</p>
                </div>
                
              </div>
            )}

            {user.role === 'delivery' && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <p className="text-gray-600 text-sm">Delivery Request Status</p>
                  <p className="font-inter font-semibold text-lg text-accent-charcoal">{user.deliveryRequestStatus || 'N/A'}</p>
                </div>
                
              </div>
            )}
          </div>

          {isEditing && (
            <button
              onClick={handleSubmit(onSubmit)}
              className="w-full px-6 py-3 bg-primary-green text-white rounded-full font-inter font-semibold hover:bg-primary-green/90 transition-colors mb-8"
            >
              Save Changes
            </button>
          )}

          {/* Previous Orders */}
          <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">Previous Orders</h2>
          {orders.length > 0 ? (
            <div className="overflow-x-auto bg-gray-50 rounded-xl p-4">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderCode}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orders.flatMap(childOrder => (childOrder.orderItems || []).map(item => `${item.name} x${item.qty}`)).join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{order.totalPrice.toFixed(2)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.orders.map(childOrder => childOrder.orderStatus).filter(status => status).join(', ')}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.paymentStatus}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-xl">
              <ShoppingBag className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="font-inter text-gray-600 text-lg">No previous orders found.</p>
              <p className="font-inter text-gray-500 text-sm mt-2">Start ordering healthy meals today!</p>
              <Link
                to="/my-orders"
                className="mt-4 inline-block bg-gradient-teal-cyan text-white px-6 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                View All Orders
              </Link>
            </div>
          )}
          <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;