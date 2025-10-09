import express from 'express';
const router = express.Router();
import { protect, restaurant, customer } from '../middleware/auth.js';
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  deleteReservation,
} from '../Controllers/ReservationController.js';

router.route('/').post(protect, createReservation).get(protect, getReservations);
router
  .route('/:id')
  .get(protect, getReservationById)
  .put(protect, updateReservation)
  .delete(protect, restaurant, deleteReservation);

export default router;
