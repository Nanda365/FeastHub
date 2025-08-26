import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getMyFavorites,
  checkFavoriteStatus,
  addFavorite,
  removeFavorite,
} from '../Controllers/FavoriteController.js';

const router = express.Router();

router.route('/').get(protect, getMyFavorites);
router.route('/:dishId').get(protect, checkFavoriteStatus);
router.route('/').post(protect, addFavorite);
router.route('/:dishId').delete(protect, removeFavorite);

export default router;