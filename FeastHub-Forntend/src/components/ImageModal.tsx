import React, { useState, useEffect } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentImageUrl: string;
  onSave: (imageUrl: string) => void;
  setNewImageUrl: (url: string) => void;
}

const ImageModal: React.FC<ImageModalProps> = ({
  isOpen,
  onClose,
  currentImageUrl,
  onSave,
  setNewImageUrl,
}) => {
  const [imageUrlInput, setImageUrlInput] = useState(currentImageUrl);

  useEffect(() => {
    setImageUrlInput(currentImageUrl);
  }, [currentImageUrl]);

  if (!isOpen) return null;

  const handleSave = () => {
    const finalImageUrl = imageUrlInput === '' ? currentImageUrl : imageUrlInput;
    onSave(finalImageUrl);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Edit Image URL</h2>
        <p className="text-gray-600 mb-4">Enter the new image URL.</p>
        <input
          type="text"
          className="w-full p-2 border border-gray-300 rounded-md mb-4"
          value={imageUrlInput}
          onChange={(e) => setImageUrlInput(e.target.value)}
          placeholder="e.g., /images/restaurant.jpg"
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

export default ImageModal;