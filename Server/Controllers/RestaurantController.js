import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';

// @desc    Get restaurant profile
// @route   GET /api/restaurants/profile
// @access  Private (Restaurant owner)
const getRestaurantProfile = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found for this user' });
    }
});

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private (Restaurant owner)
const updateRestaurantProfile = asyncHandler(async (req, res) => {
  const { name, address, description, cuisine, imageUrl, hasRecipeBox } = req.body;

  const restaurant = await Restaurant.findById(req.user.restaurantId);

  if (restaurant) {
    restaurant.name = name || restaurant.name;
    restaurant.address = address || restaurant.address;
    restaurant.description = description || restaurant.description;
    restaurant.cuisine = cuisine || restaurant.cuisine;
    restaurant.imageUrl = imageUrl || restaurant.imageUrl;
    if (hasRecipeBox !== undefined) {
      restaurant.hasRecipeBox = hasRecipeBox;
    }

    const updatedRestaurant = await restaurant.save();
    res.json({
      _id: updatedRestaurant._id,
      name: updatedRestaurant.name,
      address: updatedRestaurant.address,
      description: updatedRestaurant.description,
      cuisine: updatedRestaurant.cuisine,
      imageUrl: updatedRestaurant.imageUrl,
      hasRecipeBox: updatedRestaurant.hasRecipeBox,
    });
  } else {
    res.status(404);
    throw new Error('Restaurant not found');
  }
});

// @desc    Get restaurant menu
// @route   GET /api/restaurants/menu
// @access  Private (Restaurant owner)
const getRestaurantMenu = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user. Please ensure your restaurant request is approved.' });
    }

    const menu = await Dish.find({ restaurant: restaurant._id }).populate('restaurant', 'name');
    res.json(menu);
});

// @desc    Add a new dish to the menu
// @route   POST /api/restaurants/menu
// @access  Private (Restaurant owner)
const addDishToMenu = asyncHandler(async (req, res) => {
  const { name, description, price, imageUrl, nutrition, dietTypes, healthGoals, prepTime } = req.body;

    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const dish = new Dish({
      restaurant: restaurant._id,
      name,
      description,
      price,
      imageUrl,
      nutrition,
      dietTypes,
      healthGoals,
      prepTime,
    });

    const createdDish = await dish.save();
    res.status(201).json(createdDish);
});

// @desc    Update a dish on the menu
// @route   PUT /api/restaurants/menu/:id
// @access  Private (Restaurant owner)
const updateDish = asyncHandler(async (req, res) => {
  const { name, description, price, imageUrl, isAvailable, nutrition, dietTypes, healthGoals, prepTime } = req.body;

    const dish = await Dish.findById(req.params.id);

    if (dish) {
      dish.name = name || dish.name;
      dish.description = description || dish.description;
      dish.price = price || dish.price;
      dish.imageUrl = imageUrl || dish.imageUrl;
      dish.isAvailable = isAvailable !== undefined ? isAvailable : dish.isAvailable;
      dish.nutrition = nutrition || dish.nutrition;
      dish.dietTypes = dietTypes || dish.dietTypes;
      dish.healthGoals = healthGoals || dish.healthGoals;
      dish.prepTime = prepTime || dish.prepTime;

      const updatedDish = await dish.save();
      res.json(updatedDish);
    } else {
      res.status(404).json({ message: 'Dish not found' });
    }
});

// @desc    Delete a dish from the menu
// @route   DELETE /api/restaurants/menu/:id
// @access  Private (Restaurant owner)
const deleteDish = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found' });
    }

    const dish = await Dish.findOne({ _id: req.params.id, restaurant: restaurant._id });

    if (dish) {
      await Dish.findByIdAndDelete(req.params.id);
      res.json({ message: 'Dish removed' });
    } else {
      res.status(404).json({ message: 'Dish not found' });
    }
});

// @desc    Get restaurant orders
// @route   GET /api/restaurants/orders
// @access  Private (Restaurant owner)
const getRestaurantOrders = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user. Please ensure your restaurant request is approved.' });
    }

    const orders = await Order.find({ restaurant: restaurant._id }).populate('user', 'name email');
    res.json(orders);
});



// @desc    Get dishes by restaurant ID
// @route   GET /api/restaurants/:restaurantId/dishes
// @access  Public
// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurantById = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
});

const getAllRestaurants = asyncHandler(async (req, res) => {
    const restaurants = await Restaurant.find({});
    res.status(200).json(restaurants);
});

const getDishesByRestaurantId = asyncHandler(async (req, res) => {
    const dishes = await Dish.find({ restaurant: req.params.restaurantId });
    res.status(200).json(dishes);
});

// @desc    Generate report of completed orders
// @route   GET /api/restaurants/orders/report/completed
// @access  Private (Restaurant owner)
const generateCompletedOrdersReport = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user.' });
    }

    const completedOrders = await Order.find({ restaurant: restaurant._id, orderStatus: 'delivered' }).populate('user', 'name email');

    // For now, just send the data as JSON. CSV generation will be added later.
    res.status(200).json(completedOrders);
});

// @desc    Update order status
// @route   PUT /api/restaurants/orders/:id/status
// @access  Private (Restaurant owner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
});

// @desc    Get featured restaurants
// @route   GET /api/restaurants/featured
// @access  Public
const getFeaturedRestaurants = asyncHandler(async (req, res) => {
    try {
        const restaurants = await Restaurant.find({}).sort({ rating: -1 }).limit(3);

        const featuredRestaurants = restaurants.map(restaurant => {
            return {
                _id: restaurant?._id || null,
                name: restaurant?.name || 'Unknown Restaurant',
                cuisineType: restaurant?.cuisineType || 'Salads, Bowls, Healthy',
                rating: restaurant?.rating || 4.8,
                deliveryTime: restaurant?.deliveryTime || '20-30 min',
                healthyBadge: restaurant?.healthyBadge || true,
                image: restaurant?.imageUrl || 'https://i.postimg.cc/HxF0bCVB/sweetgreen.jpg',
            };
        });

        res.json(featuredRestaurants);
    } catch (error) {
        console.error('Error fetching featured restaurants:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// @desc    Block a restaurant
// @route   PUT /api/restaurants/:id/block
// @access  Private/Admin
const blockRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      restaurant.isBlocked = true;
      await restaurant.save();
      res.json({ message: 'Restaurant blocked successfully' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
});

// @desc    Unblock a restaurant
// @route   PUT /api/restaurants/:id/unblock
// @access  Private/Admin
const unblockRestaurant = asyncHandler(async (req, res) => {
    const restaurant = await Restaurant.findById(req.params.id);

    if (restaurant) {
      restaurant.isBlocked = false;
      await restaurant.save();
      res.json({ message: 'Restaurant unblocked successfully' });
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
});

export {
  getRestaurantProfile,
  updateRestaurantProfile,
  getRestaurantMenu,
  addDishToMenu,
  updateDish,
  deleteDish,
  getRestaurantOrders,
  updateOrderStatus,
  generateCompletedOrdersReport,
  getDishesByRestaurantId,
  getAllRestaurants,
  getRestaurantById,
  getFeaturedRestaurants,
  blockRestaurant,
  unblockRestaurant,
};