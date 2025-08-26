import express from 'express';
import {
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
} from '../Controllers/RestaurantController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.route('/').get(getAllRestaurants);

router.route('/profile')
  .get(protect, getRestaurantProfile)
  .put(protect, updateRestaurantProfile);

router.route('/menu')
  .get(protect, getRestaurantMenu)
  .post(protect, addDishToMenu);

router.route('/menu/:id')
  .put(protect, updateDish)
  .delete(protect, deleteDish);

router.route('/orders')
  .get(protect, getRestaurantOrders);

router.route('/orders/:id/status')
  .put(protect, updateOrderStatus);

router.route('/orders/report/completed')
  .get(protect, generateCompletedOrdersReport);

router.route('/:restaurantId/dishes').get(getDishesByRestaurantId);

router.route('/:id').get(getRestaurantById);

export default router;