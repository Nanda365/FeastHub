export interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  dietTypes: DietType[];
  healthGoals: HealthGoal[];
  rating: number;
  prepTime: number;
  restaurant: Restaurant | string;
  restaurantId: string;
}

export interface Restaurant {
  id: string;
  name: string;
  image: string;
  rating: number;
  deliveryTime: string;
  cuisineType: string;
  healthyBadge: boolean;
  dishes: Dish[];
}

export type DietType = 'vegetarian' | 'vegan' | 'gluten-free' | 'low-carb' | 'low-fat' | 'high-protein' | 'keto';

export type HealthGoal = 'weight-loss' | 'muscle-gain' | 'diabetes-friendly' | 'balanced-diet' | 'energy-stamina';

export type MoodType = 'happy' | 'tired' | 'stressed' | 'energetic' | 'comfort';

export interface User {
  id: string;
  name: string;
  email: string;
  dietPreferences: DietType[];
  healthGoals: HealthGoal[];
  currentMood: MoodType;
}

export interface OrderItem {
  dish: Dish;
  quantity: number;
  customizations?: string[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: 'preparing' | 'ready' | 'on-way' | 'delivered';
  estimatedTime: number;
}