import express from 'express';
import {
  createRestaurant,
  getMyRestaurant,
  updateMyRestaurant,
  uploadMedia,
} from '../controllers/restaurantController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.post('/', protect, createRestaurant);
router.get('/me', protect, getMyRestaurant);
router.put('/me', protect, updateMyRestaurant);
router.post('/upload', protect, upload.single('image'), uploadMedia);

export default router;
