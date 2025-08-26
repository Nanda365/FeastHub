import express from 'express';
import { createRazorpayOrder, verifyRazorpayPayment } from '../Controllers/PaymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/razorpay/order').post(protect, createRazorpayOrder);
router.route('/razorpay/verify').post(verifyRazorpayPayment);

export default router;
