import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';


interface User {
  _id: string;
  fullName: string;
  email: string;
  role: 'customer' | 'admin' | 'restaurant' | 'delivery';
  phone?: string;
  isAdmin?: boolean;
  restaurantRequestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  restaurantId?: string | null;
  restaurantName?: string; 
  deliveryRequestStatus?: 'none' | 'pending' | 'approved' | 'rejected';
  deliveryPartnerId?: string | null;
  deliveryRating?: number; // New property
  numDeliveryReviews?: number; // New property
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: string) => Promise<User>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);


  useEffect(() => {
    const storedUser = localStorage.getItem('feasthub_user');
    const storedToken = localStorage.getItem('feasthub_token');
    if (storedUser && storedToken) {
      const parsedUser = JSON.parse(storedUser);
      setUser({
        ...parsedUser,
        fullName: parsedUser.fullName || '',
        phone: parsedUser.phone || '',
        restaurantRequestStatus: parsedUser.restaurantRequestStatus,
        restaurantId: parsedUser.restaurantId,
        restaurantName: parsedUser.restaurantName, // Add this line
        deliveryRequestStatus: parsedUser.deliveryRequestStatus,
        deliveryPartnerId: parsedUser.deliveryPartnerId,
      });
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: string) => {
    setIsLoading(true);
    const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/users/login`, { email, password, role });
    setUser({
      ...data,
      fullName: data.fullName || '',
      phone: data.phone || '',
      restaurantRequestStatus: data.restaurantRequestStatus,
      restaurantId: data.restaurantId,
      restaurantName: data.restaurantName, // Add this line
      deliveryRequestStatus: data.deliveryRequestStatus,
      deliveryPartnerId: data.deliveryPartnerId,
    });
    setToken(data.token);
    localStorage.setItem('feasthub_user', JSON.stringify(data));
    localStorage.setItem('feasthub_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    setIsLoading(false);
    return data;
  };

  const clearUserCart = async () => {
    if (user && token) {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await axios.delete(`${import.meta.env.VITE_API_URL}/users/cart`, config);
        console.log('User cart cleared on backend.');
      } catch (error) {
        console.error('Error clearing user cart on backend:', error);
      }
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('feasthub_user');
    localStorage.removeItem('feasthub_token');
    delete axios.defaults.headers.common['Authorization'];
    clearUserCart(); // Clear cart on logout
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('feasthub_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, updateUser, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
