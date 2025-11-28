import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Dish } from '../types/Dish';
import { Search, ChefHat } from 'lucide-react';
import DishCard from '../components/DishCard';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify'; // Keep toast for other uses

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string;
  address: {
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  phone: string;
  email: string;
  description: string;
  imageUrl: string;
  openingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  isFeatured: boolean;
  menu: string[]; // Array of Dish IDs
  owner: string; // User ID of the restaurant owner
  hasRecipeBox?: boolean;
}

const RestaurantMenuPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortOrder, setSortOrder] = useState<string>('default');
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const { user, token } = useAuth(); // Assuming useAuth provides token

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!restaurantId) {
          setError('No restaurant ID provided.');
          setLoading(false);
          return;
        }

        // Fetch restaurant details
        const restaurantResponse = await axios.get<Restaurant>(`${import.meta.env.VITE_API_URL}/restaurants/${restaurantId}`);
        setRestaurant(restaurantResponse.data);

        // Fetch dishes for the restaurant
        const dishesResponse = await axios.get<Dish[]>(`${import.meta.env.VITE_API_URL}/restaurants/${restaurantId}/dishes`);
        setDishes(dishesResponse.data);

      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  const handleFilterChange = (filter: string) => {
    setSelectedFilters((prevFilters) =>
      prevFilters.includes(filter)
        ? prevFilters.filter((f) => f !== filter)
        : [...prevFilters, filter]
    );
  };

  const handleSortChange = (order: string) => {
    setSortOrder(order);
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesSearch = dish.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilters = selectedFilters.length === 0 ||
      selectedFilters.every(filter => (dish.dietTypes || []).includes(filter) || (dish.healthGoals || []).includes(filter));
    return matchesSearch && matchesFilters;
  });

  const sortedDishes = [...filteredDishes].sort((a, b) => {
    if (sortOrder === 'priceAsc') {
      return a.price - b.price;
    } else if (sortOrder === 'priceDesc') {
      return b.price - a.price;
    } else if (sortOrder === 'nameAsc') {
      return a.name.localeCompare(b.name);
    } else if (sortOrder === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }
    return 0;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-accent-charcoal mb-8">
        {restaurant ? (
          <>
            {restaurant.name} Menu
            {restaurant.hasRecipeBox && (
              <span className="ml-4 text-lg bg-teal-100 text-teal-800 px-3 py-1 rounded-full font-semibold">
                Recipe Box Available!
              </span>
            )}
          </>
        ) : (
          'Restaurant Menu'
        )}
      </h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Search Bar */}
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search dishes..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        {/* Recipe Box Button */}
        {restaurant && restaurant.hasRecipeBox && (
          <button
            onClick={() => navigate(`/create-recipe?restaurantId=${restaurantId}`)}
            className="flex items-center gap-2 bg-gradient-teal-cyan text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
          >
            <ChefHat className="w-5 h-5" />
            <span className="font-semibold">Recipe Box</span>
          </button>
        )}

        {/* Filters and Sort (simplified for now) */}
        <div className="flex gap-4">
          {/* Example Filter Button */}
          <button
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={() => handleFilterChange('vegan')}
          >
            Vegan
          </button>
          {/* Example Sort Dropdown */}
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-orange"
            value={sortOrder}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            <option value="default">Sort By</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
            <option value="nameAsc">Name: A-Z</option>
            <option value="nameDesc">Name: Z-A</option>
          </select>
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
  );
};

export default RestaurantMenuPage;