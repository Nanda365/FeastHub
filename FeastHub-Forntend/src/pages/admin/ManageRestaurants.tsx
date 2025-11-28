import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '../../contexts/AuthContext';
import { Search, Ban, CheckCircle } from 'lucide-react';

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  cuisineType: string;
  isBlocked: boolean;
}

const ManageRestaurants = () => {
  const { token } = useAuth();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchRestaurants = async () => {
    setLoading(true);
    setError(null);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      // Assuming you have an API endpoint to get all restaurants for admin
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/restaurants`, config);
      setRestaurants(data);
    } catch (err: any) {
      console.error('Error fetching restaurants:', err);
      setError(err.response?.data?.message || 'Failed to fetch restaurants.');
      toast.error(err.response?.data?.message || 'Failed to fetch restaurants.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchRestaurants();
    }
  }, [token]);

  const handleBlockUnblockRestaurant = async (restaurantId: string, block: boolean) => {
    if (window.confirm(`Are you sure you want to ${block ? 'block' : 'unblock'} this restaurant?`)) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const endpoint = block ? `${import.meta.env.VITE_API_URL}/restaurants/${restaurantId}/block` : `${import.meta.env.VITE_API_URL}/restaurants/${restaurantId}/unblock`;
        await axios.put(endpoint, {}, config);
        toast.success(`Restaurant ${block ? 'blocked' : 'unblocked'} successfully!`);
        fetchRestaurants(); // Refresh the list
      } catch (err: any) {
        console.error(`Error ${block ? 'blocking' : 'unblocking'} restaurant:`, err);
        toast.error(err.response?.data?.message || `Failed to ${block ? 'block' : 'unblock'} restaurant.`);
      }
    }
  };

  const filteredRestaurants = restaurants.filter(restaurant =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisineType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center py-4">Loading restaurants...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="font-poppins font-bold text-xl text-accent-charcoal mb-4">Manage Restaurants</h2>
      
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search restaurants by name, address, or cuisine..."
          className="w-full p-3 pl-10 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
      </div>

      {filteredRestaurants.length === 0 ? (
        <div className="text-center py-4 text-gray-600">No restaurants found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cuisine</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRestaurants.map((restaurant) => (
                <tr key={restaurant._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{restaurant.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{restaurant.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{restaurant.cuisineType}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      restaurant.isBlocked ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {restaurant.isBlocked ? 'Blocked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {restaurant.isBlocked ? (
                      <button
                        onClick={() => handleBlockUnblockRestaurant(restaurant._id, false)}
                        className="text-green-600 hover:text-green-900"
                      >
                        <CheckCircle className="w-5 h-5" /> Unblock
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBlockUnblockRestaurant(restaurant._id, true)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Ban className="w-5 h-5" /> Block
                      </button>
                    )}
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

export default ManageRestaurants;
