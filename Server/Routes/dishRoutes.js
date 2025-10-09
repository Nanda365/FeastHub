import express from 'express';
const router = express.Router();
import { getAllDishes, getAllDishesRandomly, getMoodRecommendations, deleteDish } from '../Controllers/DishController.js';
import { protect, admin } from '../middleware/auth.js';

router.route('/').get(protect, admin, getAllDishes);
router.get('/random', getAllDishesRandomly);
router.get('/mood-recommendations', getMoodRecommendations);
router.route('/:id').delete(protect, admin, deleteDish);

export { router };