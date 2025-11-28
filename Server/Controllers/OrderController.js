import Order from '../models/Order.js';
import CustomOrder from '../models/CustomOrder.js';
import Dish from '../models/Dish.js';
import Restaurant from '../models/Restaurant.js';
import asyncHandler from '../middleware/asyncHandler.js';

// Helper function to generate a random alphanumeric code
const generateOrderCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
import ParentOrder from '../models/ParentOrder.js';

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, deliveryAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  // Fetch all dish details from the database in one go
  const dishIds = orderItems.map((item) => item.dish);
  const itemsFromDB = await Dish.find({ _id: { $in: dishIds } }).populate('restaurant');

  // Group order items by restaurant
  const ordersByRestaurant = orderItems.reduce((acc, item) => {
    const dbItem = itemsFromDB.find((x) => x._id.toString() === item.dish);
    if (!dbItem) {
      // This should ideally not happen if cart is managed properly
      return acc;
    }
    const restaurantId = dbItem.restaurant._id.toString();
    if (!acc[restaurantId]) {
      acc[restaurantId] = {
        restaurant: dbItem.restaurant,
        orderItems: [],
        totalPrice: 0,
      };
    }
    acc[restaurantId].orderItems.push({
      name: dbItem.name,
      qty: item.qty,
      image: dbItem.image,
      price: dbItem.price,
      dish: dbItem._id,
    });
    acc[restaurantId].totalPrice += dbItem.price * item.qty;
    return acc;
  }, {});

  const createdOrders = [];
  let totalParentOrderPrice = 0;

  // Create an order for each restaurant
  for (const restaurantId in ordersByRestaurant) {
    const restaurantOrder = ordersByRestaurant[restaurantId];
    const orderCode = generateOrderCode();

    const order = new Order({
      user: req.user._id,
      restaurant: restaurantOrder.restaurant._id,
      orderItems: restaurantOrder.orderItems,
      totalPrice: restaurantOrder.totalPrice,
      orderCode,
      deliveryAddress,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    });

    const createdOrder = await order.save();
    
    // Update restaurant stats
    const restaurant = await Restaurant.findById(restaurantOrder.restaurant._id);
    if (restaurant) {
      restaurant.totalOrders += 1;
      restaurant.totalRevenue += restaurantOrder.totalPrice;
      await restaurant.save();
    }
    
    createdOrders.push(createdOrder);
    totalParentOrderPrice += restaurantOrder.totalPrice;
  }

  // Create a parent order
  const parentOrderCode = generateOrderCode();
  const parentOrder = new ParentOrder({
    user: req.user._id,
    orders: createdOrders.map(order => order._id),
    totalPrice: totalParentOrderPrice,
    deliveryAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    orderCode: parentOrderCode,
  });

  const createdParentOrder = await parentOrder.save();

  res.status(201).json(createdParentOrder);
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await ParentOrder.findById(req.params.id).populate({
    path: 'orders',
    populate: {
      path: 'restaurant',
      model: 'Restaurant'
    }
  }).populate('user', 'name email phone');

  if (order) {
    res.json(order);
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const parentOrders = await ParentOrder.find({ user: req.user._id }).sort({ createdAt: -1 }).populate({
    path: 'orders',
    populate: [
      { path: 'restaurant', model: 'Restaurant' },
      { path: 'orderItems.dish', model: 'Dish' }
    ]
  });
  res.json(parentOrders);
});

// @desc    Get orders for delivery partner
// @route   GET /api/orders/deliverypartner
// @access  Private (Delivery partner)
const getDeliveryPartnerOrders = asyncHandler(async (req, res) => {
  // For now, fetch all orders that are not pending or cancelled
  // In a real scenario, orders would be assigned to delivery partners
  // and filtered by deliveryPartnerId
  const orders = await Order.find({
    $or: [
      { orderStatus: 'ready' },
      {
        deliveryPartner: req.user._id,
        orderStatus: { $in: ['on-the-way', 'delivered'] },
      },
    ],
  }).sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate('restaurant', 'name address phone')
    .populate('orderItems.dish', 'name imageUrl')
    .populate('deliveryPartner', 'name deliveryRating numDeliveryReviews');

  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant owner or Delivery partner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const orderId = req.params.id;

  

  try {
    const order = await Order.findById(orderId);
    

    if (order) {
      // Basic authorization: ensure the user is either the restaurant owner
      // or a delivery partner assigned to this order (if assignment is implemented)
      // For now, just check if the user is authenticated.
      // More robust auth would check req.user.id against order.restaurant.owner or order.deliveryPartner

      order.orderStatus = orderStatus;

      if (orderStatus === 'on-the-way') {
        order.deliveryPartner = req.user._id;
      }

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders
// @route   GET /api/orders/all
// @access  Private (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate('restaurant', 'name address')
    .populate('orderItems.dish', 'name imageUrl');
  res.json(orders);
});

// @desc    Get orders for a specific restaurant
// @route   GET /api/orders/restaurant/:restaurantId
// @access  Private (Restaurant owner)
const getRestaurantOrders = asyncHandler(async (req, res) => {
  const { restaurantId } = req.params;

  // Find the restaurant and check if the logged-in user is the owner
  const restaurant = await Restaurant.findById(restaurantId);

  if (!restaurant) {
    res.status(404);
    throw new Error('Restaurant not found');
  }

  if (restaurant.owner.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to access these orders');
  }

  // Fetch both regular and custom orders
  const regularOrders = await Order.find({ restaurant: restaurantId })
    .populate('user', 'name email phone');

  let customOrders = [];
  if (restaurant.hasRecipeBox) {
    customOrders = await CustomOrder.find({ restaurant: restaurantId })
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');
  }

  // Combine and sort all orders by creation date
  const allOrders = [...regularOrders, ...customOrders].sort(
    (a, b) => b.createdAt - a.createdAt
  );

  res.json(allOrders);
});

import User from '../models/User.js';

// @desc    Rate an order (delivery and dishes)
// @route   POST /api/orders/:id/rate
// @access  Private
const rateOrder = asyncHandler(async (req, res) => {
  const { deliveryRating, dishRatings } = req.body;
  const parentOrderId = req.params.id;

  const parentOrder = await ParentOrder.findById(parentOrderId).populate('orders');

  if (parentOrder) {
    // Rate delivery
    if (deliveryRating) {
      parentOrder.deliveryRating = deliveryRating;
      for (const childOrder of parentOrder.orders) {
        childOrder.deliveryRating = deliveryRating;
        if (childOrder.deliveryPartner) {
          const deliveryPartner = await User.findById(childOrder.deliveryPartner);
          if (deliveryPartner) {
            const totalRating = deliveryPartner.deliveryRating * deliveryPartner.numDeliveryReviews;
            deliveryPartner.numDeliveryReviews += 1;
            deliveryPartner.deliveryRating = (totalRating + deliveryRating) / deliveryPartner.numDeliveryReviews;
            await deliveryPartner.save();
          }
        }
        await childOrder.save();
      }
    }

    // Rate dishes
    if (dishRatings && Array.isArray(dishRatings)) {
      for (const { dishId, rating } of dishRatings) {
        for (const childOrder of parentOrder.orders) {
          const orderItem = childOrder.orderItems.find(item => item.dish.toString() === dishId);
          if (orderItem) {
            orderItem.rating = rating;
            const dish = await Dish.findById(dishId);
            if (dish) {
              const totalRating = dish.rating * dish.numReviews;
              dish.numReviews += 1;
              dish.rating = (totalRating + rating) / dish.numReviews;
              await dish.save();
            }
            await childOrder.save();
          }
        }
      }
    }

    const updatedParentOrder = await parentOrder.save();
    res.json({ message: 'Thank you for your feedback!', order: updatedParentOrder });
  } else {
    res.status(404);
    throw new Error('Order not found');
  }
});

export { createOrder, getOrderById, getMyOrders, getDeliveryPartnerOrders, updateOrderStatus, getAllOrders, getRestaurantOrders, rateOrder };

