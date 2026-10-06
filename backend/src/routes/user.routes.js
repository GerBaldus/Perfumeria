import { Router } from 'express';
import { listUsers, createUser, updateUserRole, deleteUser } from '../controllers/user.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { requireRole } from '../middlewares/role.middleware.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get('/', listUsers);
router.post('/', createUser);
router.patch('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
