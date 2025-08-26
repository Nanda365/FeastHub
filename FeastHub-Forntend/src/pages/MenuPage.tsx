import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Filter, Star, Clock, Plus, Heart } from 'lucide-react';
import DishCard from '../components/DishCard';
import { useCart } from '../contexts/CartContext';
import axios from 'axios';
import { Dish, Restaurant } from '../types';
import { dietFilters, healthGoalFilters } from '../utils/data';

const MenuPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchDishes = async () => {
      try {
        setLoading(true);
        setError(null);
        let url = 'http://localhost:5000/api/dishes/random';
        if (restaurantId) {
          // Fetch restaurant details
          const restaurantResponse = await axios.get<Restaurant>(`http://localhost:5000/api/restaurants/${restaurantId}`);
          setRestaurant(restaurantResponse.data);
          url = `http://localhost:5000/api/restaurants/${restaurantId}/dishes`;
        }
        const response = await axios.get<Dish[]>(url);
        setDishes(response.data);
      } catch (err) {
        setError('Failed to fetch dishes. Please try again later.');
        console.error('Error fetching dishes:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  const allFilters = [...dietFilters, ...healthGoalFilters];

  const dishesToDisplay = dishes;

  const filteredDishes = dishesToDisplay.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dish.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilters = selectedFilters.length === 0 || 
                          selectedFilters.some(filter => 
                            (dish.dietTypes && dish.dietTypes.includes(filter as any)) || 
                            (dish.healthGoals && dish.healthGoals.includes(filter as any))
                          );
    
    return matchesSearch && matchesFilters;
  });

  const sortedDishes = [...filteredDishes].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      case 'calories':
        return a.nutrition.calories - b.nutrition.calories;
      default:
        return b.rating - a.rating;
    }
  });

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(f => f !== filterId)
        : [...prev, filterId]
    );
  };

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
                Healthy Menu
              </h1>
              <p className="font-inter text-gray-600">
                Discover nutritious meals crafted for your wellness journey
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search dishes, restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-primary-orange focus:outline-none transition-colors font-inter"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="lg:w-80">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-poppins font-semibold text-xl text-accent-charcoal">
                  Filters
                </h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden text-primary-orange"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>

              <div className={`space-y-6 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Sort Options */}
                <div>
                  <h3 className="font-inter font-semibold text-accent-charcoal mb-3">Sort By</h3>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                  >
                    <option value="popular">Most Popular</option>
                    <option value="rating">Highest Rated</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="calories">Lowest Calories</option>
                  </select>
                </div>

                {/* Diet & Health Filters */}
                <div>
                  <h3 className="font-inter font-semibold text-accent-charcoal mb-3">
                    Diet & Health Goals
                  </h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {allFilters.map((filter) => (
                      <label key={filter.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFilters.includes(filter.id)}
                          onChange={() => toggleFilter(filter.id)}
                          className="w-4 h-4 text-primary-orange border-gray-300 rounded focus:ring-primary-orange"
                        />
                        <span className="text-lg">{filter.icon}</span>
                        <span className="font-inter text-sm text-gray-700">{filter.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {selectedFilters.length > 0 && (
                  <button
                    onClick={() => setSelectedFilters([])}
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-xl font-inter font-medium hover:bg-gray-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="font-inter text-gray-600">
                  Showing {sortedDishes.length} dishes
                </p>
                {selectedFilters.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedFilters.map(filterId => {
                      const filter = allFilters.find(f => f.id === filterId);
                      return filter ? (
                        <span 
                          key={filterId}
                          className="bg-primary-orange text-white px-3 py-1 rounded-full text-sm font-inter flex items-center space-x-1"
                        >
                          <span>{filter.icon}</span>
                          <span>{filter.label}</span>
                          <button
                            onClick={() => toggleFilter(filterId)}
                            className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Dishes Grid */}
            {loading ? (
              <div className="text-center text-lg font-inter text-gray-600">Loading dishes...</div>
            ) : error ? (
              <div className="text-center text-lg font-inter text-red-500">{error}</div>
            ) : sortedDishes.length > 0 ? (
              <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {sortedDishes.map((dish) => (
                  <DishCard 
                    key={dish._id} 
                    dish={dish} 
                    onAddToCart={addToCart} 
                    restaurantName={restaurant ? restaurant.name : undefined}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="font-poppins font-semibold text-xl text-accent-charcoal mb-2">
                  No Dishes Found
                </h3>
                <p className="font-inter text-gray-600 mb-6">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuPage;