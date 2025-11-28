import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Dish } from '../types';
import DishCard from '../components/DishCard';
import { Heart } from 'lucide-react';

const FavoritesPage: React.FC = () => {
  const { user, token } = useAuth();
  const [favoriteDishes, setFavoriteDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!user || !token) {
        setError('Please log in to view your favorites.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await axios.get<Dish[]>(`${import.meta.env.VITE_API_URL}/favorites`, config);
        setFavoriteDishes(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Failed to fetch favorites.');
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [user, token]);

  return (
    <div className="min-h-screen bg-background-gray py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-6 flex items-center">
          <Heart className="w-8 h-8 text-red-500 mr-3" />
          Your Favorites
        </h1>

        {loading ? (
          <p className="font-inter text-gray-600 text-center">Loading your favorite dishes...</p>
        ) : error ? (
          <p className="font-inter text-red-500 text-center">Error: {error}</p>
        ) : favoriteDishes.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favoriteDishes.map((dish) => (
              <DishCard key={dish._id} dish={dish} showAddButton={true} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart className="w-24 h-24 text-gray-400 mx-auto mb-4" />
            <h3 className="font-poppins font-semibold text-xl text-accent-charcoal mb-2">
              No Favorites Yet!
            </h3>
            <p className="font-inter text-gray-600 mb-6">
              Start exploring dishes and click the heart icon to add them to your favorites.
            </p>
            <Link
              to="/menu"
              className="bg-gradient-teal-cyan text-white px-8 py-3 rounded-full font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              Browse Menu
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
