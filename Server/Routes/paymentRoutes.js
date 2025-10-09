import express from 'express';
import { processPayment, createRazorpayOrder, verifyRazorpayPayment, payForCustomOrder, verifyCustomOrderPayment, payForTableBooking, verifyTableBookingPayment } from '../Controllers/PaymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/razorpay/order').post(protect, createRazorpayOrder);
router.route('/razorpay/verify').post(protect, verifyRazorpayPayment);
router.route('/process').post(protect, processPayment);
router.route('/custom-order').post(protect, payForCustomOrder);
router.route('/custom-order/verify').post(protect, verifyCustomOrderPayment);
router.route('/table-booking').post(protect, payForTableBooking);
router.route('/table-booking/verify').post(protect, verifyTableBookingPayment);

export default router;
