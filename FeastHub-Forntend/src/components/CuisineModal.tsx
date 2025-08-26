import React, { useState, useEffect } from 'react';

interface CuisineModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCuisine: string;
  onSave: (cuisine: string) => void;
  setNewCuisine: (cuisine: string) => void;
}

const CuisineModal: React.FC<CuisineModalProps> = ({
  isOpen,
  onClose,
  currentCuisine,
  onSave,
  setNewCuisine,
}) => {
  const [cuisineInput, setCuisineInput] = useState(currentCuisine);

  useEffect(() => {
    setCuisineInput(currentCuisine);
  }, [currentCuisine]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(cuisineInput);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Cuisine</h2>
        <p className="text-gray-600 mb-4">Select or enter cuisines (separated by commas).</p>
        <select
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={cuisineInput}
          onChange={(e) => setCuisineInput(e.target.value)}
        >
          <option value="">Select a cuisine or type below</option>
          <option value="Italian">Italian</option>
          <option value="Mexican">Mexican</option>
          <option value="Indian">Indian</option>
          <option value="Chinese">Chinese</option>
          <option value="Japanese">Japanese</option>
          <option value="American">American</option>
          <option value="French">French</option>
          <option value="Mediterranean">Mediterranean</option>
          <option value="Thai">Thai</option>
          <option value="Vietnamese">Vietnamese</option>
        </select>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={cuisineInput}
          onChange={(e) => setCuisineInput(e.target.value)}
          placeholder="Or type custom cuisines here (e.g., Vegan, Gluten-Free)"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default CuisineModal;