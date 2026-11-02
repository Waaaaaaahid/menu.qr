import express from 'express';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
  bulkCreateTables,
} from '../controllers/tableController.js';
import { protect } from '../middleware/auth.js';
import { requireRestaurant } from '../middleware/restaurantAuth.js';

const router = express.Router();

router.use(protect, requireRestaurant);

router.route('/').get(getTables).post(createTable);
router.post('/bulk', bulkCreateTables);
router.route('/:id').put(updateTable).delete(deleteTable);

export default router;
