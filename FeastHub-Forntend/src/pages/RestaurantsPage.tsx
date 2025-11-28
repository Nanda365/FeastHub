import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, MapPin, Search, Star, Filter, UtensilsCrossed } from 'lucide-react';
import axios from 'axios';

interface Restaurant {
  _id: string;
  name: string;
  cuisine: string[];
  address: string;
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
  rating?: number; // Added optional rating as used in sorting
  deliveryTime?: string; // Added optional deliveryTime as used in sorting
  hasRecipeBox?: boolean;
}

const RestaurantsPage = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');

  useEffect(() => {
    const fetchRestaurants = async () => {
      setLoading(true);
      setError(null);
      try {
                const response = await axios.get<Restaurant[]>(`${import.meta.env.VITE_API_URL}/restaurants`);
        
        setRestaurants(response.data);
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

    fetchRestaurants();
  }, []);

  const cuisineTypes = [
    'all',
    'healthy',
    'vegan',
    'seafood',
    'low-carb',
    'mediterranean',
    'asian',
    'continental'
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesSearch =
      restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      restaurant.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCuisine =
      selectedCuisine === 'all' || (Array.isArray(restaurant.cuisine) && restaurant.cuisine.some(c => c.toLowerCase().includes(selectedCuisine)));

    const matchesLocation =
      locationQuery === '' || restaurant.address.toLowerCase().includes(locationQuery.toLowerCase());

    return matchesSearch && matchesCuisine && matchesLocation;
  });

  const sortedRestaurants = [...filteredRestaurants].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return (b.rating || 0) - (a.rating || 0);
      case 'delivery-time':
        return (parseInt(a.deliveryTime || '0')) - (parseInt(b.deliveryTime || '0'));
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return (b.rating || 0) - (a.rating || 0);
    }
  });

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="font-poppins font-bold text-3xl text-accent-charcoal mb-2">
                Healthy Restaurants
              </h1>
              <p className="font-inter text-gray-600">
                Discover restaurants committed to your health and wellness
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search restaurants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-full focus:border-primary-orange focus:outline-none transition-colors font-inter"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-poppins font-semibold text-xl text-accent-charcoal">
              Filter Restaurants
            </h2>
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden text-primary-orange">
              <Filter className="w-5 h-5" />
            </button>
          </div>

          <div className={`grid md:grid-cols-3 gap-6 ${showFilters ? 'block' : 'hidden lg:grid'}`}>
            {/* Cuisine Filter */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">Cuisine Type</label>
              <select
                value={selectedCuisine}
                onChange={(e) => setSelectedCuisine(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
              >
                {cuisineTypes.map((cuisine) => (
                  <option key={cuisine} value={cuisine}>
                    {cuisine === 'all' ? 'All Cuisines' : cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
              >
                <option value="rating">Highest Rated</option>
                <option value="delivery-time">Fastest Delivery</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block font-inter font-medium text-accent-charcoal mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by area or address..."
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-primary-orange focus:outline-none font-inter"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          {loading ? (
            <p className="font-inter text-gray-600">Loading restaurants...</p>
          ) : error ? (
            <p className="font-inter text-red-500">Error: {error}</p>
          ) : (
            <p className="font-inter text-gray-600">Showing {sortedRestaurants.length} restaurants</p>
          )}
        </div>

        {/* Restaurants Grid */}
        {loading ? (
          <div className="text-center text-lg font-inter text-gray-600">Loading restaurants...</div>
        ) : error ? (
          <div className="text-center text-lg font-inter text-red-500">{error}</div>
        ) : sortedRestaurants.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-8">
            {sortedRestaurants.map((restaurant) => (
              
              <div
                key={restaurant._id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                {/* Restaurant Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={restaurant.imageUrl}
                    alt={restaurant.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                </div>

                {/* Restaurant Info */}
                <div className="p-6 flex flex-col justify-between flex-grow">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Link to={`/menu/${restaurant._id}`}>
                        <h3 className="font-poppins font-bold text-xl text-accent-charcoal">{restaurant.name}</h3>
                      </Link>
                      {restaurant.hasRecipeBox && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                          <UtensilsCrossed className="w-3 h-3" /> <span>Recipe Box</span>
                        </span>
                      )}
                      <div className="flex items-center text-primary-orange">
                          <Star className="w-5 h-5 fill-current mr-1" />
                          <span className="font-inter font-semibold">4.9</span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.isArray(restaurant.cuisine) && restaurant.cuisine.map((singleCuisine, index) => (
                        <span
                          key={index}
                          className="bg-primary-orange/10 text-primary-orange px-3 py-1 rounded-full text-xs font-semibold"
                        >
                          {singleCuisine}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center text-accent-charcoal font-semibold text-lg mb-4">
                      <MapPin className="w-5 h-5 mr-2" />
                      <span className="font-inter flex-grow min-w-0 w-full overflow-hidden text-ellipsis whitespace-nowrap">{restaurant.address}</span>
                      {restaurant.deliveryTime && (
                        <>
                          <Clock className="w-4 h-4 ml-4 mr-1" />
                          <span className="font-inter">{restaurant.deliveryTime} min</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3 mt-auto">
                    <Link
                      to={`/menu/${restaurant._id}`}
                      className="flex-1 bg-gradient-teal-cyan text-white py-3 rounded-xl font-inter font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-center"
                    >
                      View Menu
                    </Link>
                    <button
                      onClick={() => {
                        const cleanedAddress = restaurant.address.replace(/\s*,\s*/g, ',').replace(/\s+/g, ' ').trim(); // Clean up address string
                        const fullQuery = `${restaurant.name}, ${cleanedAddress}`; // Combine name and cleaned address
                        const addressQuery = encodeURIComponent(fullQuery);
                        window.open(`https://www.google.com/maps/search/?api=1&query=${addressQuery}`, '_blank');
                      }}
                      className="px-4 py-3 border-2 border-primary-orange text-primary-orange rounded-xl hover:bg-primary-orange hover:text-white transition-all duration-300 flex items-center justify-center"
                    >
                      <MapPin className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="font-poppins font-semibold text-xl text-accent-charcoal mb-2">No Restaurants Found</h3>
            <p className="font-inter text-gray-600 mb-6">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantsPage;
