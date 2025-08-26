import mongoose from 'mongoose';
import asyncHandler from '../middleware/asyncHandler.js';
import User from '../models/User.js';
import Dish from '../models/Dish.js'; // Assuming Dish model exists

// @desc    Get user's favorite dishes
// @route   GET /api/users/favorites
// @access  Private
const getMyFavorites = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('favorites');
  if (user) {
    res.status(200).json(user.favorites);
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Check if a dish is in user's favorites
// @route   GET /api/users/favorites/:dishId
// @access  Private
const checkFavoriteStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const isFavorite = user.favorites.includes(req.params.dishId);
    res.status(200).json({ isFavorite });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
});

// @desc    Add dish to user's favorites
// @route   POST /api/users/favorites
// @access  Private
const addFavorite = asyncHandler(async (req, res) => {
  const { dishId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    return res.status(400).json({ message: 'Invalid Dish ID' });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $addToSet: { favorites: dishId } }
  );

  res.status(201).json({ message: 'Dish added to favorites' });
});

// @desc    Remove dish from user's favorites
// @route   DELETE /api/users/favorites/:dishId
// @access  Private
const removeFavorite = asyncHandler(async (req, res) => {
  const { dishId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(dishId)) {
    return res.status(400).json({ message: 'Invalid Dish ID' });
  }

  await User.updateOne(
    { _id: req.user._id },
    { $pull: { favorites: dishId } }
  );

  res.status(200).json({ message: 'Dish removed from favorites' });
});

export { getMyFavorites, checkFavoriteStatus, addFavorite, removeFavorite };