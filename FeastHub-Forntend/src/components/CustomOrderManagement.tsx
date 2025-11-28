import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

interface CustomOrder {
  _id: string;
  name: string;
  user: { _id: string; name: string; email: string };
  restaurant: string;
  defaultIngredients: string[];
  extraIngredients?: string;
  specialInstructions?: string;
  displayCode?: string; // Add this field
  status: 'pending' | 'accepted' | 'rejected' | 'in-progress' | 'completed';
  price: number;
  createdAt: string;
}

interface CustomOrderManagementProps {
  restaurantId: string;
}

const CustomOrderManagement: React.FC<CustomOrderManagementProps> = ({
  restaurantId,
}) => {
  const { token } = useAuth();
  const [customOrders, setCustomOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingOrderId, setEditingOrderId] = useState<string | null>(null);
  const [newPrice, setNewPrice] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;

  useEffect(() => {
    const fetchCustomOrders = async () => {
      if (!restaurantId || !token) return;

      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/custom-orders/${restaurantId}/orders`,
          config
        );
        console.log('Raw custom orders data from API:', data); // Debugging line
        const uniqueOrders = Array.from(new Map(data.map(order => [order._id, order])).values());
        // Sort orders by createdAt in descending order (newest first)
        const sortedOrders = uniqueOrders.sort((a: CustomOrder, b: CustomOrder) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setCustomOrders(sortedOrders);
      } catch (err) {
        console.error('Error fetching custom orders:', err);
        setError('Failed to fetch custom orders.');
        toast.error('Failed to fetch custom orders.');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomOrders();
  }, [restaurantId, token]);

  const handleUpdateStatus = async (
    orderId: string,
    status: 'accepted' | 'rejected',
    price?: number
  ) => {
    if (!token) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const updateData: { status: string; price?: number } = { status };
      if (price !== undefined) {
        updateData.price = price;
      }

      const { data } = await axios.put(
        `${import.meta.env.VITE_API_URL}/custom-orders/${orderId}`,
        updateData,
        config
      );

      setCustomOrders((prevOrders) =>
        prevOrders.map((order) => (order._id === orderId ? data : order))
      );
      setEditingOrderId(null);
      setNewPrice(0);
      toast.success(`Order ${status} successfully!`);
    } catch (err) {
      console.error('Error updating custom order status:', err);
      toast.error(`Failed to update order status.`);
    }
  };

  const handleNextPage = () => {
    const totalPages = Math.ceil(customOrders.length / ordersPerPage);
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (loading) return <p>Loading custom orders...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-gray-800 mb-4">Custom Recipe Box Orders</h3>
      {customOrders.length === 0 ? (
        <p>No custom orders received yet.</p>
      ) : (
        <div className="space-y-4">
          {(() => {
            const indexOfLastOrder = currentPage * ordersPerPage;
            const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
            const currentOrders = customOrders.slice(indexOfFirstOrder, indexOfLastOrder);
            const totalPages = Math.ceil(customOrders.length / ordersPerPage);

            return (
              <>
                {currentOrders.map((order) => (
                  <div key={order._id} className="border border-gray-200 p-4 rounded-lg">
                    <p className="font-medium">Order ID: {order.displayCode || order._id}</p>
                    <p>Customer: {order.user.name} ({order.user.email})</p>
                    <p>Recipe Name: {order.name}</p>
                    <p>Status: <span className={`font-semibold ${order.status === 'pending' ? 'text-yellow-600' : order.status === 'accepted' ? 'text-green-600' : order.status === 'rejected' ? 'text-red-600' : 'text-blue-600'}`}>{order.status}</span></p>
                    <p>Time Submitted: {new Date(order.createdAt).toLocaleString()}</p>
                    {order.price > 0 && <p>Price: ₹{order.price.toFixed(2)}</p>}
                    <p className="mt-2 font-medium">Ingredients:</p>
                    <ul className="list-disc list-inside ml-4">
                      {order.defaultIngredients.map((ing, i) => (
                        <li key={i}>{ing}</li>
                      ))}
                      {order.extraIngredients && <li>Extra: {order.extraIngredients}</li>}
                    </ul>
                    {order.specialInstructions && (
                      <p className="mt-2">Special Instructions: {order.specialInstructions}</p>
                    )}

                    <div className="mt-4 flex space-x-2">
                      {order.status === 'pending' && (
                        <>
                          <button
                            onClick={() => setEditingOrderId(order._id)}
                            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'rejected')}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {editingOrderId === order._id && (
                        <div className="flex items-center space-x-2 mt-2">
                          <input
                            type="number"
                            placeholder="Set Price"
                            value={newPrice}
                            onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                            className="border border-gray-300 p-2 rounded-md w-32"
                          />
                          <button
                            onClick={() => handleUpdateStatus(order._id, 'accepted', newPrice)}
                            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                          >
                            Confirm Price
                          </button>
                          <button
                            onClick={() => { setEditingOrderId(null); setNewPrice(0); }}
                            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
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
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default CustomOrderManagement;
