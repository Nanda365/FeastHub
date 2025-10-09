import express from 'express';
const router = express.Router();
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
  getFeaturedRestaurants,
  blockRestaurant,
  unblockRestaurant,
} from '../Controllers/RestaurantController.js';
import { protect, admin } from '../middleware/auth.js';

router.route('/profile').get(protect, getRestaurantProfile).put(protect, updateRestaurantProfile);
router.route('/menu').get(protect, getRestaurantMenu).post(protect, addDishToMenu);
router.route('/menu/:id').put(protect, updateDish).delete(protect, deleteDish);
router.route('/orders').get(protect, getRestaurantOrders);
router.route('/orders/:id/status').put(protect, updateOrderStatus);
router.route('/orders/report/completed').get(protect, generateCompletedOrdersReport);
router.route('/:restaurantId/dishes').get(getDishesByRestaurantId);
router.route('/').get(getAllRestaurants);
router.route('/featured').get(getFeaturedRestaurants);
router.route('/:id').get(getRestaurantById);
router.route('/:id/block').put(protect, admin, blockRestaurant);
router.route('/:id/unblock').put(protect, admin, unblockRestaurant);

export default router;