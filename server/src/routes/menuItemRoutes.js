import express from 'express';
import {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  toggleAvailability,
  deleteMenuItem,
} from '../controllers/menuItemController.js';
import { protect } from '../middleware/auth.js';
import { requireRestaurant } from '../middleware/restaurantAuth.js';

const router = express.Router();

router.use(protect, requireRestaurant);

router.route('/').get(getMenuItems).post(createMenuItem);
router.patch('/:id/toggle-availability', toggleAvailability);
router.route('/:id').get(getMenuItemById).put(updateMenuItem).delete(deleteMenuItem);

export default router;
