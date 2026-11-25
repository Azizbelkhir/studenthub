import { Router } from 'express';
import { login, verifySession } from '../controllers/authController';
import { verifyToken } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.get('/verify', verifyToken, verifySession);

export default router;
