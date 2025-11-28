import { createContext, useContext, useState, useEffect } from 'react';
import { Dish } from '../types';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface CartItem {
  _id: string; // Add _id to CartItem interface
  dish: Dish;
  quantity: number;
  customizations?: string[];
}

interface CartContextType {
  items: CartItem[];
  addToCart: (dish: Dish, quantity?: number, customizations?: string[]) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  updateQuantity: (dishId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user, token } = useAuth();

  // Fetch cart from backend when user logs in or component mounts
  useEffect(() => {
    const fetchCart = async () => {
      if (user && token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/cart`, config);
          setItems(data.map((item: any) => {
            return {
              _id: item._id, // Map _id to _id
              dish: { ...item.dish, id: item.dish._id, restaurantId: item.dish.restaurant }, // Map _id to id and restaurant to restaurantId
              quantity: item.quantity,
              customizations: item.customizations || [],
            };
            }));
            console.log('Cart fetched from backend:', data);
        } catch (error) {
              console.error('Error fetching cart from backend:', error);
          setItems([]); // Clear cart on error
        }
      } else {
        setItems([]); // Clear cart if no user or token
      }
    };
    fetchCart();
  }, [user, token]);

  // Remove localStorage persistence as cart is now stored in the backend
  useEffect(() => {
    // This useEffect is intentionally left empty or removed as localStorage is no longer used.
    // Any previous localStorage saving logic should be removed.
  }, [items]);

  const addToCart = async (dish: Dish, quantity = 1, customizations?: string[]) => {
    if (!user || !token) return; // Prevent adding to cart if not logged in

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_URL}/users/cart`,
        { dishId: dish._id, quantity, customizations },
        config
      );
      setItems(data.map((item: any) => {
        return {
          _id: item._id, // Map _id to _id
          dish: { ...item.dish, id: item.dish._id, restaurantId: item.dish.restaurant }, // Map _id to id and restaurant to restaurantId
          quantity: item.quantity,
          customizations: item.customizations || [],
        };
        }));
        console.log('Item added to cart in backend:', data);
    } catch (error) {
       console.error('Error adding item to cart in backend:', error);
    }
  };

  const removeFromCart = async (itemId: string) => {
    if (!user || !token) return;

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };
      const { data } = await axios.delete(
        `${import.meta.env.VITE_API_URL}/users/cart/${itemId}`,
        config
      );
      setItems(data.map((item: any) => {
        return {
          _id: item._id, // Map _id to _id
          dish: { ...item.dish, id: item.dish._id, restaurantId: item.dish.restaurant }, // Map _id to id and restaurant to restaurantId
          quantity: item.quantity,
          customizations: item.customizations || [],
        };
        }));
        console.log('Item removed from cart in backend:', data);
    } catch (error) {
       console.error('Error removing item from cart in backend:', error);
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!user || !token) return;

    if (quantity <= 0) {
      await removeFromCart(itemId);
      return;
    }

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      };

  
      const item = items.find(i => i._id === itemId);
      if (!item) return;

      const response = await axios.put(
          `${import.meta.env.VITE_API_URL}/users/cart`,
          { dishId: item.dish._id, quantity },
          config
        );
        console.log('Axios PUT response:', response);
        setItems(response.data.map((item: any) => {
          return {
            _id: item._id, // Map _id to _id
            dish: { ...item.dish, id: item.dish._id, restaurantId: item.dish.restaurant }, // Map _id to id and restaurant to restaurantId
            quantity: item.quantity,
            customizations: item.customizations || [],
          };
          }));
          console.log('Cart quantity updated in backend:', response.data);
    } catch (error: any) {

    }
  };

  const clearCart = async () => {
    if (!user || !token) return;

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      await axios.delete(`${import.meta.env.VITE_API_URL}/users/cart`, config);
      setItems([]);
      console.log('Cart cleared in backend.');
    } catch (error) {
      console.error('Error clearing cart in backend:', error);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.dish.price * item.quantity), 0);
  };

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getTotalItems,
      getTotalPrice
    }}>
      {children}
    </CartContext.Provider>
  );
};