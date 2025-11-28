import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import StarRating from '../components/StarRating';

interface OrderItem {
  dish: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  qty: number;
  rating?: number;
}

interface BasicItem {
  dish: string;
  name: string;
  price: number;
  quantity: number;
}

interface CustomOrder {
  _id: string;
  name: string;
  user: string;
  restaurant: {
    _id: string;
    name: string;
  };
  defaultIngredients: string[];
  extraIngredients?: string;
  specialInstructions?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed';
  price: number;
  createdAt: string;
}

interface RegularOrder {
  _id: string;
  orderCode: string;
  user: string;
  restaurant: {
    _id: string;
    name: string;
  };
  orderItems: OrderItem[];
  basicItems: BasicItem[];
  totalPrice: number;
  deliveryAddress: {
    address: string;
    city: string;
    pincode: string;
    phone: string;
  };
  orderStatus: string;
  estimatedTime?: number;
  paymentMethod: string;
  createdAt: string;
  deliveryRating?: number;
}

interface ParentOrder {
  _id: string;
  user: string;
  orders: RegularOrder[];
  totalPrice: number;
  deliveryAddress: {
    address: string;
    city: string;
    pincode: string;
    phone: string;
  };
  paymentMethod: string;
  createdAt: string;
  deliveryRating?: number;
}

type Order = CustomOrder | ParentOrder;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const [deliveryRatings, setDeliveryRatings] = useState<{ [orderId: string]: number }>({});
  const [dishRatings, setDishRatings] = useState<{ [orderId: string]: { [dishId: string]: number } }>({});

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  const shouldShowSubmitButton = (parentOrder: ParentOrder) => {
    // 1. Check if delivery rating is already submitted and persisted
    if (parentOrder.deliveryRating && parentOrder.deliveryRating > 0) {
      return false;
    }

    // 2. Check if a temporary delivery rating has been selected
    const hasSelectedDeliveryRating = (deliveryRatings[parentOrder._id] || 0) > 0;
    if (!hasSelectedDeliveryRating) {
      return false;
    }

    // 3. Check if all delivered dishes have been rated
    for (const childOrder of parentOrder.orders) {
      if (childOrder.orderStatus === 'delivered') { // Only consider delivered child orders for dish ratings
        for (const item of childOrder.orderItems) {
          // If item.rating is already present, it means it's persisted, no need to rate it again
          if (!(item.rating && item.rating > 0)) { // If the dish hasn't been permanently rated
            // Check if a temporary rating has been provided in the state
            const currentDishRating = dishRatings[parentOrder._id]?.[childOrder._id]?.[item.dish._id];
            if (!(currentDishRating && currentDishRating > 0)) {
              return false; // Found a delivered item without a temporary rating
            }
          }
        }
      }
    }

    return true; // All conditions met, show the submit button
  };


  const handleRating = (parentOrderId: string, childOrderId: string, type: 'delivery' | 'dish', value: number, dishId?: string) => {
    if (type === 'delivery') {
      setDeliveryRatings(prev => ({ ...prev, [parentOrderId]: value }));
    } else if (type === 'dish' && dishId) {
      setDishRatings(prev => ({
        ...prev,
        [parentOrderId]: {
          ...prev[parentOrderId],
          [childOrderId]: {
            ...prev[parentOrderId]?.[childOrderId],
            [dishId]: value,
          },
        },
      }));
    }
  };

  const submitRating = async (parentOrderId: string) => {
    try {
      const userInfoString = localStorage.getItem('feasthub_user');
      if (!userInfoString) {
        setError('User not logged in.');
        return;
      }
      const userInfo = JSON.parse(userInfoString);

      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const dishRatingsForParent = dishRatings[parentOrderId] || {};
      const flatDishRatings = Object.values(dishRatingsForParent).flatMap(childRatings =>
        Object.entries(childRatings).map(([dishId, rating]) => ({ dishId, rating }))
      );

      const ratingData = {
        deliveryRating: deliveryRatings[parentOrderId],
        dishRatings: flatDishRatings,
      };

      await axios.post(`/api/orders/${parentOrderId}/rate`, ratingData, config);

      // Refresh user data in AuthContext if the logged-in user is a delivery partner
      // This ensures the DeliveryDashboard (if user is DP) shows updated ratings immediately
      if (userInfo.role === 'delivery') { // Use userInfo from parsed localStorage
        const { data: updatedUserData } = await axios.get(`${import.meta.env.VITE_API_URL}/users/profile`, config);
        updateUser(updatedUserData);
      }

      // Refresh orders to show the new ratings
      const [parentOrdersResponse, customOrdersResponse] = await Promise.all([
        axios.get('/api/orders/myorders', config),
        axios.get('/api/custom-orders/myorders', config),
      ]);

      const combinedOrders = [
        ...parentOrdersResponse.data,
        ...customOrdersResponse.data,
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(combinedOrders);
      toast.success('Thank you for your feedback!');
    } catch (err) {
      console.error('Failed to submit rating:', err);
      toast.error('Failed to submit rating. Please try again.');
    }
  };


  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handlePayForCustomOrder = async (customOrderId: string, price: number) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const userInfoString = localStorage.getItem('feasthub_user');
      if (!userInfoString) {
        setError('User not logged in.');
        return;
      }
      const userInfo = JSON.parse(userInfoString);

      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const { data: order } = await axios.post(
        `${import.meta.env.VITE_API_URL}/payment/custom-order`,
        { customOrderId, amount: price },
        config
      );

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'FeastHub',
        description: 'Payment for Custom Order',
        order_id: order.id,
        handler: async function (response: any) {
          const verificationData = {
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
            customOrderId,
          };

          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/payment/custom-order/verify`,
              verificationData,
              config
            );

            // Refresh orders after successful payment
            const [regularOrdersResponse, customOrdersResponse] = await Promise.all([
              axios.get(`${import.meta.env.VITE_API_URL}/orders/myorders`, config),
              axios.get(`${import.meta.env.VITE_API_URL}/custom-orders/myorders`, config),
            ]);

            const combinedOrders = [
              ...regularOrdersResponse.data,
              ...customOrdersResponse.data,
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(combinedOrders);
            toast.success('Payment successful! Your custom order is now a regular order.');
          } catch (err: any) {
            console.error('Failed to verify payment:', err);
            toast.error(err.response?.data?.message || 'Payment verification failed. Please try again.');
          }
        },
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone,
        },
        notes: {
          address: 'FeastHub Corporate Office',
        },
        theme: {
          color: '#3399cc',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error('Failed to pay for custom order:', err);
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    }
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const userInfoString = localStorage.getItem('feasthub_user');
        if (!userInfoString) {
          setError('User not logged in.');
          setLoading(false);
          return;
        }
        const userInfo = JSON.parse(userInfoString);

        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };

        const [parentOrdersResponse, customOrdersResponse] = await Promise.all([
          axios.get('/api/orders/myorders', config),
          axios.get('/api/custom-orders/myorders', config),
        ]);

        const combinedOrders = [
          ...parentOrdersResponse.data,
          ...customOrdersResponse.data,
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        setOrders(combinedOrders);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load orders. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <p className="font-poppins text-xl text-accent-charcoal">Loading your orders...</p>
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

  return (
    <div className="min-h-screen bg-background-gray">
      <ToastContainer />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/" // Or a more appropriate back link
            className="text-gray-600 hover:text-primary-orange transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <div>
            <h1 className="font-poppins font-bold text-3xl text-accent-charcoal">
              My Orders
            </h1>
            <p className="font-inter text-gray-600">
              View your ongoing and past orders
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-10">
            <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-4">
              No orders found.
            </h2>
            <p className="font-inter text-gray-600 mb-6">
              Looks like you haven't placed any orders yet.
            </p>
            <Link
              to="/menu"
              className="bg-gradient-teal-cyan text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <>
            <div className="grid gap-6">
              {currentOrders.map((order) => (
                <div key={order._id} className="bg-white rounded-2xl shadow-lg p-6">
                  {'orders' in order ? (
                    <>
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                          Order Group
                        </h2>
                        <span className="font-inter text-gray-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mb-4">
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Total Price:</span> ₹{order.totalPrice.toFixed(2)}
                        </p>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Payment Method:</span> {order.paymentMethod}
                        </p>
                        <p className="font-inter text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.deliveryAddress ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}` : 'Delivery address not available'}
                        </p>
                      </div>
                      <div className="space-y-4">
                        {order.orders.map(childOrder => (
                          <div key={childOrder._id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-center mb-2">
                              <h3 className="font-poppins font-semibold text-lg text-accent-charcoal">
                                Restaurant: {childOrder.restaurant.name}
                              </h3>
                              <span className={`font-inter font-semibold px-3 py-1 rounded-full text-sm
                                ${childOrder.orderStatus === 'delivered' ? 'bg-green-100 text-green-700'
                                  : childOrder.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700'
                                  : childOrder.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700'
                                  : childOrder.orderStatus === 'preparing' ? 'bg-orange-100 text-orange-700'
                                  : childOrder.orderStatus === 'ready' ? 'bg-purple-100 text-purple-700'
                                  : childOrder.orderStatus === 'on-the-way' ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'}`}
                              >
                                {childOrder.orderStatus}
                              </span>
                            </div>
                            <ul className="space-y-2">
                              {childOrder.orderItems.map((item) => (
                                <li key={item.dish._id} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <img src={item.dish.imageUrl} alt={item.dish.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                                    <p className="font-inter text-gray-700">
                                      {item.dish.name} x {item.qty}
                                    </p>
                                  </div>
                                  {childOrder.orderStatus === 'delivered' && (
                                    <div className="flex items-center">
                                      <p className="font-inter text-gray-600 mr-2">Rate Dish:</p>
                                      <StarRating
                                        rating={item.rating || dishRatings[order._id]?.[childOrder._id]?.[item.dish._id] || 0}
                                        onRating={(rating) => handleRating(order._id, childOrder._id, 'dish', rating, item.dish._id)}
                                        readonly={!!item.rating}
                                      />
                                    </div>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                      {'orders' in order && order.orders.every(o => o.orderStatus === 'delivered') && (
                        <div className="border-t border-gray-200 pt-4 mt-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <p className="font-inter text-gray-600 mr-2">Rate Delivery:</p>
                              <StarRating
                                rating={order.deliveryRating || deliveryRatings[order._id] || 0}
                                onRating={(rating) => handleRating(order._id, '', 'delivery', rating)}
                                readonly={!!order.deliveryRating}
                              />
                            </div>
                            {shouldShowSubmitButton(order) && (
                              <button
                                onClick={() => submitRating(order._id)}
                                className="bg-gradient-teal-cyan text-white px-6 py-2 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                              >
                                Submit Rating
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                        {`Custom Order from ${order.restaurant.name}`}
                      </h2>
                      <span className={`font-inter font-semibold px-3 py-1 rounded-full text-sm
                        ${order.status === 'accepted' ? 'bg-green-100 text-green-700'
                          : order.status === 'rejected' ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {orders.length > ordersPerPage && (
              <div className="flex justify-center mt-8 space-x-4">
                <button
                  onClick={() => {
                  setCurrentPage(prev => Math.max(prev - 1, 1));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  disabled={currentPage === 1}
                  className="px-6 py-2 rounded-full font-inter font-semibold transition-all duration-300
                             bg-primary-orange text-white hover:bg-dark-orange disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="font-inter text-lg text-accent-charcoal flex items-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => {
                  setCurrentPage(prev => Math.min(prev + 1, totalPages));
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                  disabled={currentPage === totalPages}
                  className="px-6 py-2 rounded-full font-inter font-semibold transition-all duration-300
                             bg-primary-orange text-white hover:bg-dark-orange disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
export default OrdersPage;