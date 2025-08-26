import Order from '../models/Order.js';
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
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, totalPrice, basicItems, deliveryAddress, estimatedTime, paymentMethod, paymentStatus } = req.body;

  if (orderItems && orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  } else {
    // Fetch dish details to ensure price and name are correct and not manipulated by client
    const itemsFromDB = await Dish.find({
      _id: { $in: orderItems.map((x) => x.dish) },
    });

    const matchOrderItems = orderItems.map((item) => {
      const dbItem = itemsFromDB.find((x) => x._id.toString() === item.dish);
      if (!dbItem) {
        res.status(404);
        throw new Error(`Dish not found for ID: ${item.dish}`);
      }
      return {
        name: dbItem.name,
        qty: item.qty,
        image: dbItem.image,
        price: dbItem.price,
        dish: dbItem._id,
        restaurant: dbItem.restaurant,
      };
    });

    // Calculate total price on the server side to prevent client-side manipulation
    const calculatedTotalPrice = matchOrderItems.reduce(
      (acc, item) => acc + item.price * item.qty,
      0
    );

    const orderCode = generateOrderCode();

    const order = new Order({
      user: req.user._id,
      restaurant: matchOrderItems[0].restaurant, // Assuming all dishes in an order are from the same restaurant
      orderItems: matchOrderItems,
      totalPrice: calculatedTotalPrice,
      orderCode: orderCode, // Add the generated order code
      basicItems: basicItems || [],
      deliveryAddress,
      estimatedTime,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'Pending' : 'Paid',
    });

    const createdOrder = await order.save();

    // Update restaurant stats
    const restaurant = await Restaurant.findById(matchOrderItems[0].restaurant);
    if (restaurant) {
      console.log('Restaurant stats before update:', restaurant.totalOrders, restaurant.totalRevenue);
      restaurant.totalOrders += 1;
      restaurant.totalRevenue += calculatedTotalPrice;
      console.log('Restaurant stats after update (before save):', restaurant.totalOrders, restaurant.totalRevenue);
      await restaurant.save();
      console.log('Restaurant stats saved successfully.');
    }

    res.status(201).json(createdOrder);
  }
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

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
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 }).populate(
    'user',
    'name email'
  ).populate('orderItems.dish', 'name imageUrl');
  res.json(orders);
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
    .populate('user', 'name email')
    .populate('restaurant', 'name address phone')
    .populate('orderItems.dish', 'name imageUrl')
    .populate('deliveryPartner', 'name');

  res.json(orders);
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Restaurant owner or Delivery partner)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus } = req.body;
  const orderId = req.params.id;

  console.log(`Attempting to update order ${orderId} to status: ${orderStatus}`);

  try {
    const order = await Order.findById(orderId);
    console.log('Order retrieved from DB:', order);

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
    console.error('Error updating order status:', error);
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all orders
// @route   GET /api/orders/all
// @access  Private (Admin only)
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('restaurant', 'name address')
    .populate('orderItems.dish', 'name imageUrl');
  res.json(orders);
});

export { createOrder, getOrderById, getMyOrders, getDeliveryPartnerOrders, updateOrderStatus, getAllOrders };