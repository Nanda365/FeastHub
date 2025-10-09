import express from 'express';
import { createCustomOrder, updateCustomOrderStatus, getCustomOrdersForRestaurant, updateCustomOrder, getMyCustomOrders } from '../Controllers/CustomOrderController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').post(protect, createCustomOrder);
router.route('/myorders').get(protect, getMyCustomOrders);
router.route('/:id/status').put(protect, updateCustomOrderStatus);
router.route('/:restaurantId/orders').get(protect, getCustomOrdersForRestaurant);
router.route('/:orderId').put(protect, updateCustomOrder);

export default router;
