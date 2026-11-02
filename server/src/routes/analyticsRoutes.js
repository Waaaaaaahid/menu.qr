import express from 'express';
import {
  getDashboardStats,
  getDetailedAnalytics,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';
import { requireRestaurant } from '../middleware/restaurantAuth.js';

const router = express.Router();

router.use(protect, requireRestaurant);

router.get('/dashboard', getDashboardStats);
router.get('/detailed', getDetailedAnalytics);

export default router;
