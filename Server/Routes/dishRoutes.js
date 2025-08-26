import express from 'express';
const router = express.Router();
import { getAllDishesRandomly } from '../Controllers/DishController.js';

router.get('/random', getAllDishesRandomly);

export { router };