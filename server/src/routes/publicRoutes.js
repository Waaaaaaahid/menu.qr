import express from 'express';
import { getPublicMenu } from '../controllers/restaurantController.js';
import { placeOrder, getOrderById } from '../controllers/orderController.js';
import { recordMenuView } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/menu/:slug', getPublicMenu);
router.post('/orders', placeOrder);
router.get('/orders/:id', getOrderById);
router.post('/analytics/view', recordMenuView);

export default router;
