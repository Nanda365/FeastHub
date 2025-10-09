import Razorpay from 'razorpay';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// @desc    Process general payment
// @route   POST /api/payment/process
// @access  Private
const processPayment = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // amount in smallest currency unit (e.g., paise for INR)
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// @desc    Create Razorpay order
// @route   POST /api/payment/razorpay/order
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount, currency } = req.body;

  const options = {
    amount: amount * 100, // amount in smallest currency unit (e.g., paise for INR)
    currency,
    receipt: `receipt_order_${Date.now()}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

// @desc    Verify Razorpay payment
// @route   POST /api/payment/razorpay/verify
// @access  Private
const verifyRazorpayPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const crypto = await import('crypto');
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    res.status(200).json({ message: 'Payment verified successfully' });
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

import CustomOrder from '../models/CustomOrder.js';
import Order from '../models/Order.js';
import Restaurant from '../models/Restaurant.js';
import User from '../models/User.js';
import Table from '../models/Table.js';
import Reservation from '../models/Reservation.js';

// @desc    Process payment for a custom order
// @route   POST /api/payment/custom-order
// @access  Private
const payForCustomOrder = asyncHandler(async (req, res) => {
  const { customOrderId, amount } = req.body;

  const customOrder = await CustomOrder.findById(customOrderId);

  if (!customOrder) {
    res.status(404);
    throw new Error('Custom order not found');
  }

  if (customOrder.status !== 'accepted' || customOrder.price <= 0) {
    res.status(400);
    throw new Error('Custom order not accepted or price not set');
  }

  const options = {
    amount: amount * 100, // amount in smallest currency unit (e.g., paise for INR)
    currency: 'INR',
    receipt: customOrderId,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json(order);
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order', error: error.message });
  }
});

const verifyCustomOrderPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, customOrderId } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const crypto = await import('crypto');
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    const customOrder = await CustomOrder.findById(customOrderId);

    if (!customOrder) {
      res.status(404);
      throw new Error('Custom order not found');
    }

    // Convert custom order to a regular order
    const user = await User.findById(customOrder.user);
    const restaurant = await Restaurant.findById(customOrder.restaurant);

    if (!user || !restaurant) {
      res.status(404);
      throw new Error('User or Restaurant not found');
    }

    if (!user.deliveryAddress || user.deliveryAddress.length === 0) {
      res.status(400);
      throw new Error('User has no delivery address set.');
    }

    const basicItems = [
      {
        dish: customOrder.name, // Using custom order name as dish string
        quantity: 1,
        price: customOrder.price,
        name: customOrder.name,
      },
    ];

    const newOrder = new Order({
      user: user._id,
      restaurant: restaurant._id,
      basicItems: basicItems,
      totalPrice: customOrder.price,
      orderStatus: 'pending',
      orderCode: Math.floor(100000 + Math.random() * 900000).toString(), // Random 6-digit code
      deliveryAddress: user.deliveryAddress[0], // Assuming user has a default delivery address
      paymentMethod: 'Paid (Custom Order)',
      paymentStatus: 'Paid',
      customOrder: customOrder._id,
    });

    const createdOrder = await newOrder.save();

    // Delete the custom order after conversion
     customOrder.status = 'completed';
     customOrder.convertedToOrder = createdOrder._id;
     await customOrder.save();

    res.status(201).json({ message: 'Custom order paid and converted to regular order', order: createdOrder });

  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

// @desc    Process payment for table booking
// @route   POST /api/payment/table-booking
// @access  Private
const payForTableBooking = asyncHandler(async (req, res) => {
  const { amount, restaurantId, tableId, numberOfGuests, reservationTime, customerPhone, specialRequests } = req.body;

  console.log('Amount received from frontend:', amount);

  // Create Razorpay order
  const options = {
    amount: amount * 100, // amount in smallest currency unit (e.g., paise for INR)
    currency: 'INR',
    receipt: `table_${tableId}`,
  };

  try {
    const order = await razorpayInstance.orders.create(options);
    console.log('Razorpay order object:', order);

    res.status(200).json({ message: 'Razorpay order created', order });
  } catch (error) {
    console.error('Error creating Razorpay order for table booking:', error);
    res.status(500).json({ message: 'Failed to create Razorpay order for table booking', error: error.message });
  }
});

const verifyTableBookingPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, restaurantId, tableId, numberOfGuests, reservationTime, customerPhone, specialRequests } = req.body;

  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const crypto = await import('crypto');
  const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Create reservation
    const reservation = new Reservation({
      user: req.user._id,
      restaurant: restaurantId,
      table: tableId,
      numberOfGuests,
      reservationTime,
      customerPhone,
      specialRequests,
      status: 'confirmed', // Directly confirmed after payment
      paymentStatus: 'Paid',
      paymentId: razorpay_payment_id, // Store Razorpay payment ID
    });

    const createdReservation = await reservation.save();

    // Update table status to reserved
    const table = await Table.findById(tableId);
    if (table) {
      table.status = 'reserved';
      await table.save();
    }

    res.status(200).json({ message: 'Table booking payment verified and reservation created', reservation: createdReservation });
  } else {
    res.status(400).json({ message: 'Payment verification failed' });
  }
});

export { createRazorpayOrder, verifyRazorpayPayment, payForCustomOrder, processPayment, verifyCustomOrderPayment, payForTableBooking, verifyTableBookingPayment };
