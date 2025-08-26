interface Dish {
  _id: string;
  restaurant: string;
  name: string;
  description: string;
  price: number;

  imageUrl?: string;
  isAvailable: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  dietTypes?: string[];
  healthGoals?: string[];
  rating?: number;
  prepTime?: number;
  numReviews?: number;
  createdAt: string;
  updatedAt: string;
}

interface DishData {
  name: string;
  description: string;
  price: number;

  imageUrl?: string;
  isAvailable?: boolean;
  nutrition?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
  dietTypes?: string[];
  healthGoals?: string[];
  prepTime?: number;
}