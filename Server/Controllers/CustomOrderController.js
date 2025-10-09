import CustomOrder from '../models/CustomOrder.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Create a new custom order
// @route   POST /api/custom-orders
// @access  Private
const createCustomOrder = asyncHandler(async (req, res) => {
  const {
    name,
    restaurant: restaurantId,
    defaultIngredients,
    extraIngredients,
    specialInstructions,
  } = req.body;

  // Ensure defaultIngredients is an array
  const ingredients = Array.isArray(defaultIngredients) ? defaultIngredients : (defaultIngredients ? [defaultIngredients] : []);

  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant || !restaurant.hasRecipeBox) {
    res.status(400);
    throw new Error('This restaurant does not support custom recipe orders.');
  }

  const customOrder = new CustomOrder({
    name,
    user: req.user._id,
    restaurant: restaurantId,
    defaultIngredients: ingredients,
    extraIngredients,
    specialInstructions,
    displayCode: Math.floor(10000 + Math.random() * 90000).toString(), // Random 5-digit code
  });

  // Check for existing identical order within a short timeframe to prevent duplicates
  const existingOrder = await CustomOrder.findOne({
    user: req.user._id,
    restaurant: restaurantId,
    name,
    defaultIngredients: ingredients,
    createdAt: { $gte: new Date(Date.now() - 60 * 1000) }, // Within the last 60 seconds
  });

  if (existingOrder) {
    return res.status(200).json(existingOrder); // Return existing order if found
  }

  try {
    const createdCustomOrder = await customOrder.save();
    res.status(201).json(createdCustomOrder);
  } catch (error) {
    console.error('Error saving custom order:', error);
    res.status(500).json({ message: 'Failed to save custom order.' });
  }
});

// @desc    Update custom order status
// @route   PUT /api/custom-orders/:id/status
// @access  Private (Restaurant owner)
const updateCustomOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const orderId = req.params.id;

  const order = await CustomOrder.findById(orderId);

  if (order) {
    order.status = status;
    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Custom order not found');
  }
});

const getCustomOrdersForRestaurant = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;
  const orders = await CustomOrder.find({ restaurant: restaurantId }).populate('user', 'name email');
  res.json(orders);
});

const updateCustomOrder = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const { status, price } = req.body;

  const order = await CustomOrder.findById(orderId);

  if (order) {
    order.status = status || order.status;
    order.price = price || order.price;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } else {
    res.status(404);
    throw new Error('Custom order not found');
  }
});

const getMyCustomOrders = asyncHandler(async (req, res) => {
  const orders = await CustomOrder.find({ user: req.user._id }).populate('restaurant', 'name');
  res.json(orders);
});

export { createCustomOrder, updateCustomOrderStatus, getCustomOrdersForRestaurant, updateCustomOrder, getMyCustomOrders };
