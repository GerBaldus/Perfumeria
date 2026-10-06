import { Router } from 'express';
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', listProducts);
router.get('/:id', getProduct);
router.post('/', requireAuth, requireRole('vendedor', 'admin'), createProduct);
router.patch('/:id', requireAuth, requireRole('vendedor', 'admin'), updateProduct);
router.delete('/:id', requireAuth, requireRole('vendedor', 'admin'), deleteProduct);

export default router;
