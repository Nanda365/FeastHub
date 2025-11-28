
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { X } from 'lucide-react';

const defaultIngredientsList = [
  'Rice',
  'Chicken',
  'Paneer',
  'Onion',
  'Tomato',
  'Spices',
  'Cheese',
  'Bell Peppers',
  'Mushrooms',
];

interface Address {
  _id: string;
  address: string;
  city: string;
  pincode: string;
  phone: string;
}

const CreateRecipePage = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const restaurantId = new URLSearchParams(location.search).get('restaurantId');

  const [recipeName, setRecipeName] = useState('');
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [extraIngredients, setExtraIngredients] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [errors, setErrors] = useState<{ recipeName?: string; restaurantId?: string, address?: string }>({});
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ address: '', city: '', pincode: '', phone: '' });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user && token) {
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          };
          const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/users/addresses`, config);
          setAddresses(data);
          if (data.length > 0) {
            setSelectedAddress(data[0]._id);
          }
        } catch (error) {
          console.error('Failed to fetch addresses:', error);
        }
      }
    };
    fetchAddresses();
  }, [user, token]);

  const handleIngredientChange = (ingredient: string) => {
    setSelectedIngredients((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  const handleAddAddress = async () => {
    if (user && token) {
      try {
        const config = {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        };
        const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/users/addresses`, newAddress, config);
        setAddresses([...addresses, data]);
        setSelectedAddress(data._id);
        setShowAddAddressForm(false);
        setNewAddress({ address: '', city: '', pincode: '', phone: '' });
      } catch (error) {
        console.error('Failed to add address:', error);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (!user) {
      // Handle case where user is not logged in
      console.error('You must be logged in to create a recipe.');
      // You might want to redirect to login page
      navigate('/login');
      return;
    }

    const newErrors: { recipeName?: string; restaurantId?: string, address?: string } = {};
    if (!recipeName.trim()) {
      newErrors.recipeName = 'Recipe Name is required.';
    }
    if (!restaurantId) {
      newErrors.restaurantId = 'Restaurant ID is missing.';
    }
    if (!selectedAddress) {
      newErrors.address = 'Please select a delivery address.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const recipeData = {
      name: recipeName,
      restaurant: restaurantId,
      defaultIngredients: selectedIngredients,
      extraIngredients,
      specialInstructions,
      deliveryAddress: selectedAddress,
    };

    try {
        const config = {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          };
    
          await axios.post(`${import.meta.env.VITE_API_URL}/custom-orders`, recipeData, config);
      // Reset form
      setRecipeName('');
      setSelectedIngredients([]);
      setExtraIngredients('');
      setSpecialInstructions('');
      // Navigate to a success page or back to the menu
      navigate(`/menu/${restaurantId}`);
    } catch (error) {
      console.error('Failed to save recipe:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background-gray flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-md relative">
        <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-6 text-center">
          Create Your Own Recipe
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="recipeName" className="block text-sm font-medium text-gray-700">Recipe Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              id="recipeName"
              className={`mt-1 block w-full border ${errors.recipeName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm p-2`}
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              required
            />
            {errors.recipeName && <p className="text-red-500 text-xs mt-1">{errors.recipeName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Default Ingredients</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {defaultIngredientsList.map((ingredient) => (
                <label key={ingredient} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={ingredient}
                    checked={selectedIngredients.includes(ingredient)}
                    onChange={() => handleIngredientChange(ingredient)}
                    className="form-checkbox"
                  />
                  <span>{ingredient}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="extraIngredients" className="block text-sm font-medium text-gray-700">Extra Ingredients</label>
            <textarea
              id="extraIngredients"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={extraIngredients}
              onChange={(e) => setExtraIngredients(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700">Special Cooking Instructions</label>
            <textarea
              id="specialInstructions"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Delivery Address</label>
            <div className="mt-2 space-y-2">
              {addresses.map((address) => (
                <label key={address._id} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="address"
                    value={address._id}
                    checked={selectedAddress === address._id}
                    onChange={() => setSelectedAddress(address._id)}
                    className="form-radio"
                  />
                  <span>{`${address.address}, ${address.city}, ${address.pincode}`}</span>
                </label>
              ))}
            </div>
            {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
            <button type="button" onClick={() => setShowAddAddressForm(!showAddAddressForm)} className="text-sm text-blue-500 mt-2">
              {showAddAddressForm ? 'Cancel' : 'Add a new address'}
            </button>
          </div>

          {showAddAddressForm && (
            <div className="space-y-4 p-4 border rounded-md">
              <h3 className="font-medium">Add New Address</h3>
              <div>
                <label htmlFor="newAddress_address" className="block text-sm font-medium text-gray-700">Address</label>
                <input type="text" id="newAddress_address" value={newAddress.address} onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="newAddress_city" className="block text-sm font-medium text-gray-700">City</label>
                <input type="text" id="newAddress_city" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="newAddress_pincode" className="block text-sm font-medium text-gray-700">Pincode</label>
                <input type="text" id="newAddress_pincode" value={newAddress.pincode} onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <div>
                <label htmlFor="newAddress_phone" className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="text" id="newAddress_phone" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
              </div>
              <button type="button" onClick={handleAddAddress} className="bg-blue-500 text-white px-4 py-2 rounded-md">
                Save Address
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-gradient-teal-cyan text-white px-6 py-2 rounded-md hover:shadow-lg transition-shadow"
            >
              Submit Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRecipePage;
