import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Dish } from '../types/Dish';

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish?: Dish; // Optional, for editing existing dishes
  onSave: (dishData: any) => void;
  onDelete?: (dishId: string) => void; // Optional, for deleting existing dishes
}

const DishModal: React.FC<DishModalProps> = ({
  isOpen,
  onClose,
  dish,
  onSave,
  onDelete,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [dietTypes, setDietTypes] = useState<string[]>([]);
  const [healthGoals, setHealthGoals] = useState<string[]>([]);
  const [prepTime, setPrepTime] = useState('');

  useEffect(() => {
    if (dish) {
      setName(dish.name || '');
      setDescription(dish.description || '');
      setPrice(dish.price ? String(dish.price) : '');

      setImageUrl(dish.imageUrl || '');
      setIsAvailable(dish.isAvailable !== undefined ? dish.isAvailable : true);
      setCalories(dish.nutrition?.calories ? String(dish.nutrition.calories) : '');
      setProtein(dish.nutrition?.protein ? String(dish.nutrition.protein) : '');
      setCarbs(dish.nutrition?.carbs ? String(dish.nutrition.carbs) : '');
      setFat(dish.nutrition?.fat ? String(dish.nutrition.fat) : '');
      setDietTypes(dish.dietTypes || []);
      setHealthGoals(dish.healthGoals || []);
      setPrepTime(dish.prepTime ? String(dish.prepTime) : '');
    } else {
      // Reset form for new dish
      setName('');
      setDescription('');
      setPrice('');

      setImageUrl('');
      setIsAvailable(true);
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setDietTypes([]);
      setHealthGoals([]);
      setPrepTime('');
    }
  }, [dish]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dishData = {
      name,
      description,
      price: parseFloat(price),

      imageUrl,
      isAvailable,
      nutrition: {
        calories: calories ? parseFloat(calories) : undefined,
        protein: protein ? parseFloat(protein) : undefined,
        carbs: carbs ? parseFloat(carbs) : undefined,
        fat: fat ? parseFloat(fat) : undefined,
      },
      dietTypes,
      healthGoals,
      prepTime: prepTime ? parseInt(prepTime) : undefined,
    };
    onSave(dishData);
  };

  const handleDelete = () => {
    if (dish && onDelete) {
      onDelete(dish._id);
    }
  };

  const allowedDietTypes = [
    'vegetarian',
    'vegan',
    'gluten-free',
    'low-carb',
    'high-protein',
    'keto'
  ];

  const allowedHealthGoals = [
    'weight-loss',
    'muscle-gain',
    'diabetes-friendly',
    'balanced-diet',
    'energy-stamina'
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700">
          <X className="w-6 h-6" />
        </button>
        <h2 className="font-poppins font-bold text-2xl text-accent-charcoal mb-6">
          {dish ? 'Edit Dish' : 'Add New Dish'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Dish Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="price"
              step="0.01"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700">Image URL</label>
            <input
              type="url"
              id="imageUrl"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700">Nutrition Information (per serving)</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="calories" className="block text-sm font-medium text-gray-700">Calories</label>
                <input
                  type="number"
                  id="calories"
                  step="1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="protein" className="block text-sm font-medium text-gray-700">Protein (g)</label>
                <input
                  type="number"
                  id="protein"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="carbs" className="block text-sm font-medium text-gray-700">Carbs (g)</label>
                <input
                  type="number"
                  id="carbs"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="fat" className="block text-sm font-medium text-gray-700">Fat (g)</label>
                <input
                  type="number"
                  id="fat"
                  step="0.1"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700">Dietary Types</h3>
            <div className="flex flex-wrap gap-2">
              {allowedDietTypes.map((type) => (
                <label key={type} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={type}
                    checked={dietTypes.includes(type)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setDietTypes([...dietTypes, type]);
                      } else {
                        setDietTypes(dietTypes.filter((d) => d !== type));
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <h3 className="text-md font-medium text-gray-700">Health Goals</h3>
            <div className="flex flex-wrap gap-2">
              {allowedHealthGoals.map((goal) => (
                <label key={goal} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    value={goal}
                    checked={healthGoals.includes(goal)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setHealthGoals([...healthGoals, goal]);
                      } else {
                        setHealthGoals(healthGoals.filter((h) => h !== goal));
                      }
                    }}
                    className="form-checkbox"
                  />
                  <span>{goal.charAt(0).toUpperCase() + goal.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="prepTime" className="block text-sm font-medium text-gray-700">Preparation Time (minutes)</label>
            <input
              type="number"
              id="prepTime"
              step="1"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={prepTime}
              onChange={(e) => setPrepTime(e.target.value)}
            />
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isAvailable"
              className="h-4 w-4 text-primary-orange border-gray-300 rounded"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Available</label>
          </div>
          <div className="flex justify-end space-x-3">
            {dish && onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="bg-gradient-teal-cyan text-white px-4 py-2 rounded-md hover:shadow-lg transition-shadow"
            >
              {dish ? 'Save Changes' : 'Add Dish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DishModal;