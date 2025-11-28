import React from 'react';
import { Clock, Star, Plus, Heart, Leaf, Trash2, Pencil } from 'lucide-react';
import { Dish } from '../types';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // Import useAuth
import { toast } from 'react-toastify'; // Import toast for notifications
import axios from 'axios'; // Import axios
import StarRating from './StarRating';

interface DishCardProps {
  dish: Dish;
  showAddButton?: boolean;
  restaurantName?: string;
  onEdit?: (dish: Dish) => void;
  onDelete?: (dish: Dish) => void;
}

const DishCard: React.FC<DishCardProps> = ({ dish, showAddButton = true, restaurantName, onEdit, onDelete }) => {
  const { addToCart } = useCart();
  const { user, token } = useAuth(); // Get user and token from AuthContext
  const [isFavorite, setIsFavorite] = React.useState(false); // State for favorite status

  // Check if dish is in user's favorites on component mount
  React.useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (user && token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          // Assuming an API endpoint to check if a dish is favorited by the user
          const response = await axios.get(`${import.meta.env.VITE_API_URL}/favorites/${dish._id}`, config);
          setIsFavorite(response.data.isFavorite);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    checkFavoriteStatus();
  }, [user, token, dish._id]); // Re-run if user, token, or dish changes

  const getDietBadgeColor = (dietType: string) => {
    const colors: { [key: string]: string } = {
      'vegetarian': 'bg-green-100 text-green-800',
      'vegan': 'bg-green-100 text-green-800',
      'gluten-free': 'bg-yellow-100 text-yellow-800',
      'low-carb': 'bg-orange-100 text-orange-800',
      'high-protein': 'bg-blue-100 text-blue-800',
      'keto': 'bg-purple-100 text-purple-800'
    };
    return colors[dietType] || 'bg-gray-100 text-gray-800';
  };

  const getHealthBadgeColor = (healthGoal: string) => {
    const colors: { [key: string]: string } = {
      'balanced-diet': 'bg-primary-orange text-accent-charcoal',
      'heart-healthy': 'bg-red-100 text-red-800',
      'weight-loss': 'bg-purple-100 text-purple-800',
      'muscle-gain': 'bg-blue-100 text-blue-800',
      'diabetes-friendly': 'bg-yellow-100 text-yellow-800',
      'immune-boosting': 'bg-green-100 text-green-800'
    };
    return colors[healthGoal] || 'bg-gray-100 text-gray-800';
  };

  const handleLikeToggle = async () => {
    if (!user || !token) {
      toast.info('Please log in to add items to your favorites.');
      return;
    }

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      if (isFavorite) {
        // Remove from favorites
        await axios.delete(`${import.meta.env.VITE_API_URL}/favorites/${dish._id}`, config);
        toast.success('Removed from favorites!');
      } else {
        // Add to favorites
        await axios.post(`${import.meta.env.VITE_API_URL}/favorites`, { dishId: dish._id }, config);
        toast.success('Added to favorites!');
      }
      setIsFavorite(!isFavorite); // Toggle local state
    } catch (error: any) {
      console.error('Error toggling favorite status:', error);
      toast.error(error.response?.data?.message || 'Failed to update favorites.');
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden border border-gray-50">
      {/* Image Container */}
      <div className="relative overflow-hidden">
        <img
          src={dish.imageUrl}
          alt={dish.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          {/* Like Button */}
          <button
            onClick={handleLikeToggle}
            className="bg-white rounded-full p-2 border-2 border-red-500 hover:bg-red-500 transition-all duration-300 group"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500 group-hover:fill-white group-hover:text-white' : 'text-red-500 group-hover:text-white'}`} />
          </button>
          {onEdit && (
            <button
              onClick={() => onEdit(dish)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-300 group"
            >
              <Pencil className="w-4 h-4 text-gray-600 group-hover:text-blue-500 transition-colors" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(dish._id)}
              className="bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-all duration-300 group"
            >
              <Trash2 className="w-4 h-4 text-gray-600 group-hover:text-red-500 transition-colors" />
            </button>
          )}
        </div>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1">
          <StarRating rating={dish.rating} readonly={true} onRating={() => {}} />
          <span className="font-inter font-semibold text-sm text-accent-charcoal">({dish.numReviews})</span>
        </div>

        {/* Health Badges */}
        <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
          {dish.healthGoals.map((goal, index) => (
            <div key={index} className={`bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 flex items-center space-x-1 ${getHealthBadgeColor(goal)}`}>
              <Leaf className="w-3 h-3" />
              <span className="font-inter text-xs font-medium">{goal.replace('-', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Restaurant Name */}
        <p className="font-inter text-sm text-gray-500 mb-2">{restaurantName}</p>

        {/* Dish Name */}
        <h3 className="font-poppins font-semibold text-lg text-accent-charcoal mb-2 group-hover:text-primary-orange transition-colors">
          {dish.name}
        </h3>

        {/* Description */}
        <p className="font-inter text-gray-600 text-sm mb-4 line-clamp-2">
          {dish.description}
        </p>

        {/* Diet Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {dish.dietTypes.slice(0, 2).map((diet, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-inter font-medium ${getDietBadgeColor(diet)}`}
            >
              {diet.replace('-', ' ')}
            </span>
          ))}
        </div>

        {/* Nutrition Info */}
        <div className="bg-background-cream rounded-xl p-3 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="font-poppins font-bold text-lg text-primary-orange">{dish.nutrition.calories}</div>
              <div className="font-inter text-xs text-gray-600">Calories</div>
            </div>
            <div className="text-center">
              <div className="font-poppins font-bold text-lg text-primary-green">{dish.nutrition.protein}g</div>
              <div className="font-inter text-xs text-gray-600">Protein</div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-gray-500">
              <Clock className="w-4 h-4" />
              <span className="font-inter text-sm">{dish.prepTime} min</span>
            </div>
            <div className="font-poppins font-bold text-xl text-accent-charcoal">
              ₹{dish.price}
            </div>
          </div>

          {showAddButton && (
            <button
              onClick={() => addToCart(dish)}
              className="bg-gradient-teal-cyan text-white p-3 rounded-full hover:shadow-lg transform hover:scale-110 transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DishCard;