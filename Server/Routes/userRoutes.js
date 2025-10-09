import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  deleteUser,
  getUserStats,
  getActiveRestaurants,
  getDeliveryPartners,
  addToCart,
  getCart,
  updateCart,
  clearUserCart,
  removeCartItem,
  verifyUser,
  resendVerificationCode,
  getAllUsers,
  getUserById,
  updateUserRole,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
} from '../Controllers/UserController.js';
import { protect, admin } from '../middleware/auth.js';
import { createRestaurantRequest, getRestaurantRequests, updateRestaurantRequestStatus, approveRestaurantRequest, rejectRestaurantRequest } from '../Controllers/RestaurantRequestController.js';
import { createDeliveryRequest, getDeliveryRequests, updateDeliveryRequestStatus, approveDeliveryRequest, rejectDeliveryRequest } from '../Controllers/DeliveryRequestController.js';

const router = express.Router();

router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/verify').post(verifyUser);
router.route('/resend-verification').post(resendVerificationCode);
router.route('/profile').get(protect, getUserProfile).put(protect, updateUserProfile);

router.route('/addresses')
  .get(protect, getUserAddresses)
  .post(protect, addUserAddress);

router.route('/addresses/:id')
  .put(protect, updateUserAddress)
  .delete(protect, deleteUserAddress);

router.route('/cart')
  .post(protect, addToCart)
  .get(protect, getCart)
  .put(protect, updateCart)
  .delete(protect, clearUserCart);

router.route('/stats').get(protect, admin, getUserStats);
router.route('/restaurants/active').get(protect, admin, getActiveRestaurants);
router.route('/delivery-partners/active').get(protect, admin, getDeliveryPartners);

router.route('/restaurant-requests')
  .post(protect, createRestaurantRequest)
  .get(protect, admin, getRestaurantRequests);

router.route('/restaurant-requests/:id/approve')
  .put(protect, admin, approveRestaurantRequest);

router.route('/restaurant-requests/:id/reject')
  .put(protect, admin, rejectRestaurantRequest);

router.route('/delivery-requests')
  .post(protect, createDeliveryRequest)
  .get(protect, admin, getDeliveryRequests);

router.route('/delivery-requests/:id/approve')
  .put(protect, admin, approveDeliveryRequest);

router.route('/delivery-requests/:id/reject')
  .put(protect, admin, rejectDeliveryRequest);

router.route('/cart/:itemId').delete(protect, removeCartItem);

router.route('/:id').delete(protect, deleteUser);

router.route('/').get(protect, admin, getAllUsers);
router.route('/:id').get(protect, admin, getUserById);
router.route('/:id/role').put(protect, admin, updateUserRole);

export default router;