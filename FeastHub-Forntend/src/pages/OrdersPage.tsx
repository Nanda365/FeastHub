import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';

interface OrderItem {
  dish: {
    _id: string;
    name: string;
    imageUrl: string;
  };
  qty: number;
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
}

type Order = CustomOrder | RegularOrder;

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  // Pagination Logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(orders.length / ordersPerPage);

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
      alert('Razorpay SDK failed to load. Are you online?');
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
        'http://localhost:5000/api/payment/custom-order',
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
              'http://localhost:5000/api/payment/custom-order/verify',
              verificationData,
              config
            );

            // Refresh orders after successful payment
            const [regularOrdersResponse, customOrdersResponse] = await Promise.all([
              axios.get('http://localhost:5000/api/orders/myorders', config),
              axios.get('http://localhost:5000/api/custom-orders/myorders', config),
            ]);

            const combinedOrders = [
              ...regularOrdersResponse.data,
              ...customOrdersResponse.data,
            ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setOrders(combinedOrders);
            alert('Payment successful! Your custom order is now a regular order.');
          } catch (err: any) {
            console.error('Failed to verify payment:', err);
            alert(err.response?.data?.message || 'Payment verification failed. Please try again.');
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
      alert(err.response?.data?.message || 'Payment failed. Please try again.');
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

        const [regularOrdersResponse, customOrdersResponse] = await Promise.all([
          axios.get('/api/orders/myorders', config),
          axios.get('/api/custom-orders/myorders', config),
        ]);

        const combinedOrders = [
          ...regularOrdersResponse.data,
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
                  {'orderCode' in order ? (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                        Order #{order.orderCode}
                      </h2>
                      <span className={`font-inter font-semibold px-3 py-1 rounded-full text-sm
                        ${order.orderStatus === 'delivered' ? 'bg-green-100 text-green-700'
                          : order.orderStatus === 'cancelled' ? 'bg-red-100 text-red-700'
                          : order.orderStatus === 'pending' ? 'bg-yellow-100 text-yellow-700'
                          : order.orderStatus === 'preparing' ? 'bg-orange-100 text-orange-700'
                          : order.orderStatus === 'ready' ? 'bg-purple-100 text-purple-700'
                          : order.orderStatus === 'on-the-way' ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700'}`}
                      >
                        {order.orderStatus}
                      </span>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="font-poppins font-bold text-xl text-accent-charcoal">
                        {'orderCode' in order ? `Order #${order.orderCode}` : `Custom Order from ${order.restaurant.name}`}
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

                  <div className="mb-4">
                    {'orderCode' in order ? (
                      <>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Total:</span> ₹{order.totalPrice.toFixed(2)}
                        </p>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Ordered On:</span> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Payment Method:</span> {order.paymentMethod}
                        </p>
                        <p className="font-inter text-gray-600 flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          {order.deliveryAddress ? `${order.deliveryAddress.address}, ${order.deliveryAddress.city}` : 'Delivery address not available'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Recipe Name:</span> {order.name}
                        </p>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Ordered On:</span> {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                        <p className="font-inter text-gray-600 mb-1">
                          <span className="font-semibold">Default Ingredients:</span> {order.defaultIngredients.join(', ')}
                        </p>
                        {order.extraIngredients && (
                          <p className="font-inter text-gray-600 mb-1">
                            <span className="font-semibold">Extra Ingredients:</span> {order.extraIngredients}
                          </p>
                        )}
                        {order.specialInstructions && (
                          <p className="font-inter text-gray-600 mb-1">
                            <span className="font-semibold">Instructions:</span> {order.specialInstructions}
                          </p>
                        )}
                        {order.status === 'accepted' && order.price > 0 && (
                          <p className="font-inter text-gray-600 mb-1">
                            <span className="font-semibold">Price:</span> ₹{order.price.toFixed(2)}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-3">Items:</h3>
                    {'orderCode' in order ? (
                      <ul className="space-y-2">
                        {order.orderItems.map((item) => (
                          <li key={item.dish._id} className="flex items-center">
                            <img src={item.dish.imageUrl} alt={item.dish.name} className="w-12 h-12 rounded-lg object-cover mr-3" />
                            <p className="font-inter text-gray-700">
                              {item.dish.name} x {item.qty}
                            </p>
                          </li>
                        ))}
                        {order.basicItems && order.basicItems.map((item) => (
                          <li key={item.dish} className="flex items-center">
                            <p className="font-inter text-gray-700">
                              {item.name} x {item.quantity} (Basic Item)
                            </p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-inter text-gray-700">See ingredients above.</p>
                    )}
                  </div>

                  {'orderCode' in order && order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && order.estimatedTime && (
                    <div className="mt-4 bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <p className="font-inter text-blue-700 font-semibold">
                        Estimated Delivery in: {order.estimatedTime} minutes
                      </p>
                    </div>
                  )}

                  {!('orderCode' in order) && order.status === 'accepted' && order.price > 0 && (
                    <div className="mt-4">
                      <button
                        onClick={() => handlePayForCustomOrder(order._id, order.price)}
                        className="bg-gradient-teal-cyan text-white px-6 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                      >
                        Pay Now (₹{order.price.toFixed(2)})
                      </button>
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