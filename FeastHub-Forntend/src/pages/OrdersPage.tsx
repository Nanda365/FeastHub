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

interface Order {
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

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const response = await axios.get('/api/orders/myorders', config);
        setOrders(response.data);
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
              className="bg-gradient-orange-yellow text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Start Ordering
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl shadow-lg p-6">
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

                <div className="mb-4">
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
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-3">Items:</h3>
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
                </div>

                {order.orderStatus !== 'Delivered' && order.orderStatus !== 'Cancelled' && order.estimatedTime && (
                  <div className="mt-4 bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-blue-600" />
                    <p className="font-inter text-blue-700 font-semibold">
                      Estimated Delivery in: {order.estimatedTime} minutes
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;