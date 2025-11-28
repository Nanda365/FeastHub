import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Trash2, Search } from 'lucide-react';

interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  restaurant: { _id: string; name: string };
}

const ManageDishes = () => {
  const { token } = useAuth();
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDishes = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Assuming you have an API endpoint to get all dishes for admin
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/dishes`, config);
      setDishes(data);
    } catch (err: any) {
      console.error('Error fetching dishes:', err);
      setError(err.response?.data?.message || 'Failed to fetch dishes.');
      toast.error(err.response?.data?.message || 'Failed to fetch dishes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDishes();
    }
  }, [token]);

  const handleDeleteDish = async (dishId: string) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(`${import.meta.env.VITE_API_URL}/dishes/${dishId}`, config);
        toast.success('Dish deleted successfully!');
        fetchDishes(); // Refresh the list
      } catch (err: any) {
        console.error('Error deleting dish:', err);
        toast.error(err.response?.data?.message || 'Failed to delete dish.');
      }
    }
  };

  const filteredDishes = dishes.filter(dish =>
    dish.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dish.restaurant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Loading dishes...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-4">Manage Dishes</h2>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search dishes by name or restaurant..."
          className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {filteredDishes.length === 0 ? (
        <div className="text-center py-4 text-gray-600">No dishes found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dish Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDishes.map((dish) => (
                <tr key={dish._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img className="h-10 w-10 rounded-full object-cover" src={dish.imageUrl || '/images/placeholder.jpg'} alt={dish.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{dish.name}</div>
                        <div className="text-sm text-gray-500">{dish.description.substring(0, 50)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{dish.restaurant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">₹{dish.price.toFixed(2)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleDeleteDish(dish._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageDishes;
