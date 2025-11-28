import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Star, MapPin, Utensils } from 'lucide-react';
import RestaurantTableBookingForm from '../components/RestaurantTableBookingForm';

interface Restaurant {
  _id: string;
  name: string;
  address: string;
  description?: string;
  cuisine?: string[];
  imageUrl?: string;
  avgRating: number;
  numReviews: number;
  hasRecipeBox?: boolean; // Assuming this can indicate table booking capability for now
}

const TableBookingPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (restaurantId) {
          // Fetch single restaurant details if restaurantId is in URL
          const response = await axios.get<Restaurant>(`${import.meta.env.VITE_API_URL}/restaurants/${restaurantId}`);
          setSelectedRestaurant(response.data);
        } else {
          // Fetch all restaurants if no specific restaurantId
          const response = await axios.get<Restaurant[]>(`${import.meta.env.VITE_API_URL}/restaurants`);
          setRestaurants(response.data);
        }
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || 'Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (loading) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen bg-background-gray flex items-center justify-center text-red-500">Error: {error}</div>;
  }

  if (restaurantId && selectedRestaurant) {
    // Display booking form for a specific restaurant
    return (
      <div className="min-h-screen bg-background-gray py-8 flex items-center justify-center">
        <RestaurantTableBookingForm restaurantId={restaurantId} restaurantName={selectedRestaurant.name} />
      </div>
    );
  }

  if (restaurantId && !selectedRestaurant) {
    // Restaurant not found for booking
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center text-red-500">
        Restaurant not found for booking.
      </div>
    );
  }

  // Display list of restaurants for booking
  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6">Book a Table</h1>
        <p className="font-inter text-gray-600 mb-8">Select a restaurant to book your table.</p>

        {restaurants.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <Utensils className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="font-poppins font-semibold text-xl text-accent-charcoal mb-2">No Restaurants Available for Booking</h3>
            <p className="font-inter text-gray-600 mb-4">It seems there are no restaurants currently offering table bookings.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col">
                <img
                  src={restaurant.imageUrl || '/images/placeholder.jpg'}
                  alt={restaurant.name}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4 flex-grow flex flex-col">
                  <h3 className="font-poppins font-bold text-xl text-accent-charcoal mb-2">{restaurant.name}</h3>
                  <p className="font-inter text-gray-600 text-sm mb-2 flex items-center"><MapPin className="w-4 h-4 mr-1" /> {restaurant.address}</p>
                  <div className="flex items-center mb-4">
                    <Star className="w-4 h-4 text-accent-yellow fill-current mr-1" />
                    <span className="font-inter text-sm text-gray-600">{restaurant.avgRating.toFixed(1)} ({restaurant.numReviews} reviews)</span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {restaurant.cuisine && restaurant.cuisine.map((c, idx) => (
                      <span key={idx} className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {c}
                      </span>
                    ))}
                  </div>
                  <p className="font-inter text-gray-700 text-sm mb-4 flex-grow">{restaurant.description?.substring(0, 100)}...</p>
                  <button
                    onClick={() => navigate(`/book-table/${restaurant._id}`)}
                    className="mt-auto bg-gradient-teal-cyan text-white px-6 py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
                  >
                    Book Table
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TableBookingPage;