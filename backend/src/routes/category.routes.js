import { Router } from 'express';
import {
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/category.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.get('/', listCategories);
router.post('/', requireAuth, requireRole('vendedor', 'admin'), createCategory);
router.patch('/:id', requireAuth, requireRole('vendedor', 'admin'), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
