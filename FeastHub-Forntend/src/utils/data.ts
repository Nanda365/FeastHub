import { Restaurant, Dish, DietType, HealthGoal } from '../types';

export const featuredRestaurants: Restaurant[] = [
  {
    id: '1',
    name: 'Green Kitchen',
    image: 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.8,
    deliveryTime: '20-30 min',
    cuisineType: 'Healthy • Vegan • Organic',
    healthyBadge: true,
  },
  {
    id: '2',
    name: 'Ocean Fresh',
    image: 'https://images.pexels.com/photos/67468/pexels-photo-67468.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.9,
    deliveryTime: '25-35 min',
    cuisineType: 'Seafood • Protein Rich • Keto',
    healthyBadge: true,
  },
  {
    id: '3',
    name: 'FitBite Express',
    image: 'https://images.pexels.com/photos/1410236/pexels-photo-1410236.jpeg?auto=compress&cs=tinysrgb&w=400',
    rating: 4.7,
    deliveryTime: '15-25 min',
    cuisineType: 'Low Carb • High Protein • Gluten Free',
    healthyBadge: true,
  }
];

const restaurantMap = new Map<string, string>();
featuredRestaurants.forEach(r => restaurantMap.set(r.name, r.id));

export const featuredDishes: Dish[] = [
  {
    id: '1',
    name: 'Quinoa Buddha Bowl',
    description: 'Nutritious quinoa bowl with roasted vegetables, avocado, and tahini dressing',
    price: 285,
    imageUrl: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 420, protein: 15, carbs: 45, fat: 18 },
    dietTypes: ['vegetarian', 'vegan', 'gluten-free'],
    healthGoals: ['weight-loss', 'balanced-diet'],
    rating: 4.8,
    prepTime: 15,
    restaurant: 'Green Kitchen',
    restaurantId: restaurantMap.get('Green Kitchen') || '',
  },
  {
    id: '2',
    name: 'Grilled Salmon & Asparagus',
    description: 'Wild-caught salmon with roasted asparagus and lemon herb butter',
    price: 425,
    imageUrl: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 380, protein: 35, carbs: 8, fat: 22 },
    dietTypes: ['low-carb', 'high-protein'],
    healthGoals: ['muscle-gain', 'balanced-diet'],
    rating: 4.9,
    prepTime: 20,
    restaurant: 'Ocean Fresh',
    restaurantId: restaurantMap.get('Ocean Fresh') || '',
  },
  {
    id: '3',
    name: 'Mediterranean Chickpea Salad',
    description: 'Fresh chickpea salad with cucumber, tomatoes, olives, and feta cheese',
    price: 235,
    imageUrl: 'https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 320, protein: 12, carbs: 35, fat: 14 },
    dietTypes: ['vegetarian', 'gluten-free'],
    healthGoals: ['weight-loss', 'diabetes-friendly'],
    rating: 4.7,
    prepTime: 10,
    restaurant: 'FitBite Express',
    restaurantId: restaurantMap.get('FitBite Express') || '',
  },
  {
    id: '4',
    name: 'Protein Power Smoothie Bowl',
    description: 'Acai smoothie bowl topped with fresh berries, nuts, and protein powder',
    price: 195,
    imageUrl: 'https://images.pexels.com/photos/1092730/pexels-photo-1092730.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 295, protein: 20, carbs: 28, fat: 12 },
    dietTypes: ['vegetarian', 'gluten-free'],
    healthGoals: ['energy-stamina', 'muscle-gain'],
    rating: 4.6,
    prepTime: 5,
    restaurant: 'Green Kitchen',
    restaurantId: restaurantMap.get('Green Kitchen') || '',
  },
  {
    id: '5',
    name: 'Chicken & Broccoli Stir-fry',
    description: 'Lean chicken breast with fresh broccoli and a light soy-ginger sauce',
    price: 350,
    imageUrl: 'https://images.pexels.com/photos/699953/pexels-photo-699953.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 400, protein: 40, carbs: 25, fat: 15 },
    dietTypes: ['high-protein', 'low-carb'],
    healthGoals: ['muscle-gain', 'weight-loss'],
    rating: 4.7,
    prepTime: 20,
    restaurant: 'Ocean Fresh',
    restaurantId: restaurantMap.get('Ocean Fresh') || '',
  },
  {
    id: '6',
    name: 'Vegan Lentil Soup',
    description: 'Hearty and wholesome lentil soup with mixed vegetables and herbs',
    price: 210,
    imageUrl: 'https://images.pexels.com/photos/616837/pexels-photo-616837.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
    nutrition: { calories: 280, protein: 10, carbs: 40, fat: 8 },
    dietTypes: ['vegan', 'vegetarian'],
    healthGoals: ['balanced-diet', 'weight-loss'],
    rating: 4.5,
    prepTime: 15,
    restaurant: 'FitBite Express',
    restaurantId: restaurantMap.get('FitBite Express') || '',
  },
  {
    id: '7',
    name: 'Beef & Quinoa Salad',
    description: 'Grilled beef strips with quinoa, mixed greens, and a light vinaigrette',
    price: 480,
    imageUrl: 'https://images.pexels.com/photos/106343/pexels-photo-106343.jpeg?auto=compress&cs=tinysrgb&w=400',
    nutrition: { calories: 550, protein: 45, carbs: 30, fat: 25 },
    dietTypes: ['high-protein'],
    healthGoals: ['muscle-gain', 'energy-stamina'],
    rating: 4.9,
    prepTime: 25,
    restaurant: 'Green Kitchen',
    restaurantId: restaurantMap.get('Green Kitchen') || '',
  }
];

export const dietFilters = [
  { id: 'vegetarian', label: 'Vegetarian', icon: '🥬', color: 'bg-green-100 text-green-800' },
  { id: 'vegan', label: 'Vegan', icon: '🌱', color: 'bg-green-100 text-green-800' },
  { id: 'gluten-free', label: 'Gluten Free', icon: '🌾', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'low-carb', label: 'Low Carb', icon: '🥩', color: 'bg-orange-100 text-orange-800' },
  { id: 'high-protein', label: 'High Protein', icon: '💪', color: 'bg-blue-100 text-blue-800' },
  { id: 'keto', label: 'Keto', icon: '🥑', color: 'bg-purple-100 text-purple-800' }
];

export const healthGoalFilters = [
  { id: 'weight-loss', label: 'Weight Loss', icon: '⚖️', color: 'bg-pink-100 text-pink-800' },
  { id: 'muscle-gain', label: 'Muscle Gain', icon: '💪', color: 'bg-blue-100 text-blue-800' },
  { id: 'diabetes-friendly', label: 'Diabetes Friendly', icon: '❤️', color: 'bg-red-100 text-red-800' },
  { id: 'balanced-diet', label: 'Balanced Diet', icon: '⚖️', color: 'bg-green-100 text-green-800' },
  { id: 'energy-stamina', label: 'Energy & Stamina', icon: '⚡', color: 'bg-yellow-100 text-yellow-800' }
];

export const moodRecommendations = {
  happy: {
    title: "You're Glowing! ✨",
    description: "Perfect time for fresh, colorful meals",
    dishes: featuredDishes.filter(dish => dish.dietTypes.includes('vegetarian'))
  },
  tired: {
    title: "Need an Energy Boost? 💪",
    description: "High-protein meals to fuel your day",
    dishes: featuredDishes.filter(dish => dish.healthGoals.includes('energy-stamina'))
  },
  stressed: {
    title: "Time for Comfort Food 🤗",
    description: "Nourishing meals to help you unwind",
    dishes: featuredDishes.filter(dish => dish.healthGoals.includes('balanced-diet'))
  }
};