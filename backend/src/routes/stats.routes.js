import { Router } from 'express';
import { salesBySeller, sellerOrders, listSellers } from '../controllers/stats.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('vendedor', 'admin'));

router.get('/sales', salesBySeller);
router.get('/orders', sellerOrders);
router.get('/sellers', requireRole('admin'), listSellers);

export default router;
