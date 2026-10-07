import { Router } from 'express';
import { register, login, me, updateMe, changePassword } from '../controllers/auth.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', requireAuth, me);
router.put('/me', requireAuth, updateMe);
router.put('/me/password', requireAuth, changePassword);

export default router;
