import Restaurant from '../models/Restaurant.js';
import Dish from '../models/Dish.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

// @desc    Get restaurant profile
// @route   GET /api/restaurants/profile
// @access  Private (Restaurant owner)
const getRestaurantProfile = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found for this user' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update restaurant profile
// @route   PUT /api/restaurants/profile
// @access  Private (Restaurant owner)
const updateRestaurantProfile = async (req, res) => {
  
  const { name, address, description, cuisine, imageUrl } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (restaurant) {
      restaurant.name = name || restaurant.name;
      restaurant.address = address || restaurant.address;
      restaurant.description = description || restaurant.description;
      restaurant.cuisine = cuisine !== undefined ? cuisine : restaurant.cuisine;
      restaurant.imageUrl = imageUrl !== undefined ? imageUrl : restaurant.imageUrl;

      const savedRestaurant = await restaurant.save();
      
      res.json(savedRestaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found for this user' });
    }
  } catch (error) {
    console.error('Error in updateRestaurantProfile:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurant menu
// @route   GET /api/restaurants/menu
// @access  Private (Restaurant owner)
const getRestaurantMenu = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user. Please ensure your restaurant request is approved.' });
    }

    const menu = await Dish.find({ restaurant: restaurant._id }).populate('restaurant', 'name');
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a new dish to the menu
// @route   POST /api/restaurants/menu
// @access  Private (Restaurant owner)
const addDishToMenu = async (req, res) => {
  const { name, description, price, imageUrl, nutrition, dietTypes, healthGoals, prepTime } = req.body;

  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a dish on the menu
// @route   PUT /api/restaurants/menu/:id
// @access  Private (Restaurant owner)
const updateDish = async (req, res) => {
  const { name, description, price, imageUrl, isAvailable, nutrition, dietTypes, healthGoals, prepTime } = req.body;

  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a dish from the menu
// @route   DELETE /api/restaurants/menu/:id
// @access  Private (Restaurant owner)
const deleteDish = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get restaurant orders
// @route   GET /api/restaurants/orders
// @access  Private (Restaurant owner)
const getRestaurantOrders = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user. Please ensure your restaurant request is approved.' });
    }

    const orders = await Order.find({ restaurant: restaurant._id }).populate('user', 'name email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



// @desc    Get dishes by restaurant ID
// @route   GET /api/restaurants/:restaurantId/dishes
// @access  Public
// @desc    Get all restaurants
// @route   GET /api/restaurants
// @access  Public
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.status(200).json(restaurants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDishesByRestaurantId = async (req, res) => {
  try {
    const dishes = await Dish.find({ restaurant: req.params.restaurantId });
    res.status(200).json(dishes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate report of completed orders
// @route   GET /api/restaurants/orders/report/completed
// @access  Private (Restaurant owner)
const generateCompletedOrdersReport = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ owner: req.user._id });

    if (!restaurant) {
      return res.status(404).json({ message: 'Restaurant not found for this user.' });
    }

    const completedOrders = await Order.find({ restaurant: restaurant._id, orderStatus: 'delivered' }).populate('user', 'name email');

    // For now, just send the data as JSON. CSV generation will be added later.
    res.status(200).json(completedOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/restaurants/orders/:id/status
// @access  Private (Restaurant owner)
const updateOrderStatus = async (req, res) => {
  const { orderStatus } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.orderStatus = orderStatus;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
};