import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Clock, Award } from 'lucide-react';
import { featuredRestaurants } from '../utils/data';
import DishCard from './DishCard';

const FeaturedRestaurants = () => {
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

        <div className="space-y-16">
          {featuredRestaurants.map((restaurant) => (
            <div key={restaurant.id} className="bg-white rounded-3xl shadow-xl overflow-hidden">
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
                        <h3 className="font-poppins font-bold text-2xl text-white">
                          {restaurant.name}
                        </h3>
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

        {/* View All Restaurants Button */}
        <div className="text-center mt-12">
          <Link to="/restaurants" className="bg-gradient-orange-yellow text-white px-8 py-4 rounded-full font-inter font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            Explore All Healthy Restaurants
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedRestaurants;