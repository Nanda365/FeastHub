import express from 'express';
const router = express.Router();
import { protect, restaurant, customer } from '../middleware/auth.js';
import {
  createTable,
  getTables,
  getTableById,
  updateTable,
  deleteTable,
} from '../Controllers/TableController.js';

router.route('/').post(protect, restaurant, createTable).get(protect, getTables);
router
  .route('/:id')
  .get(protect, restaurant, getTableById)
  .put(protect, restaurant, updateTable)
  .delete(protect, restaurant, deleteTable);

export default router;
