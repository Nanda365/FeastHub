import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Award, UtensilsCrossed } from 'lucide-react';
import axios from 'axios';

interface Restaurant {
  _id: string;
  name: string;
  image: string;
  healthyBadge?: boolean;
  cuisineType: string;
  rating: number;
  deliveryTime: string;
  hasRecipeBox?: boolean; // Add this property
}


const FeaturedRestaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedRestaurants = async () => {
      try {
        const response = await axios.get('/api/restaurants/featured');
        setRestaurants(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch featured restaurants.');
        setLoading(false);
      }
    };

    fetchFeaturedRestaurants();
  }, []);

  return (
    <section className="py-16 bg-background-gray">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="font-poppins font-bold text-3xl sm:text-4xl text-accent-charcoal mb-4">
            Top Healthy Restaurants
          </h2>
          <p className="font-inter text-gray-600 text-lg max-w-2xl mx-auto">
            Carefully curated restaurants that prioritize nutrition, sustainability, and amazing taste
          </p>
        </div>

        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">{error}</div>}

        {!loading && !error && (
          <div className="space-y-16">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
                {/* Restaurant Header */}
                <div className="relative h-64 overflow-hidden">
                  <img
                    src={restaurant.image}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>

                  {/* Restaurant Info Overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-3 mb-2">
                          <Link to={`/menu/${restaurant._id}`}>
                            <h3 className="font-poppins font-bold text-2xl text-white">
                              {restaurant.name}
                            </h3>
                          </Link>
                          {restaurant.hasRecipeBox && (
                            <span className="bg-blue-500 text-white text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                              <UtensilsCrossed className="w-3 h-3" /> <span>Recipe Box</span>
                            </span>
                          )}
                          {restaurant.healthyBadge && (
                            <div className="bg-primary-green text-white rounded-full px-3 py-1 flex items-center space-x-1">
                              <Award className="w-4 h-4" />
                              <span className="font-inter text-sm font-medium">Verified Healthy</span>
                            </div>
                          )}
                        </div>
                        <p className="font-inter text-gray-200 text-lg">{restaurant.cuisineType}</p>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center space-x-1 mb-1">
                          <Star className="w-5 h-5 text-accent-yellow fill-current" />
                          <span className="font-poppins font-bold text-white text-lg">{restaurant.rating}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-200">
                          <Clock className="w-4 h-4" />
                          <span className="font-inter text-sm">{restaurant.deliveryTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Restaurants Button */}
        <div className="text-center mt-12">
          <Link to="/restaurants" className="bg-gradient-teal-cyan text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Explore All Healthy Restaurants
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;