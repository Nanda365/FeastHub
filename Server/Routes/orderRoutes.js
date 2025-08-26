import express from 'express';
const router = express.Router();
import { createOrder, getOrderById, getMyOrders, getDeliveryPartnerOrders, updateOrderStatus, getAllOrders } from '../Controllers/OrderController.js';
import { protect, admin } from '../middleware/auth.js';

router.route('/').post(protect, createOrder);
router.route('/myorders').get(protect, getMyOrders);

router.route('/deliverypartner').get(protect, getDeliveryPartnerOrders);

router.route('/all').get(protect, admin, getAllOrders); // Moved this line up

router.route('/:id').get(protect, getOrderById);
router.route('/:id/status').put(protect, updateOrderStatus);

export default router;