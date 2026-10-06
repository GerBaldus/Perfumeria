import { Router } from 'express';
import {
  listOrders,
  getOrder,
  createOrder,
  updateOrderStatus,
} from '../controllers/order.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(requireAuth);

router.get('/', listOrders);
router.get('/:id', getOrder);
router.post('/', requireRole('cliente'), createOrder);
router.patch('/:id/status', requireRole('vendedor', 'admin'), updateOrderStatus);

export default router;
