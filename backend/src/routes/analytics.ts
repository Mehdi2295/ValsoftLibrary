import { Router } from 'express';
import { getDashboardStats } from '../controllers/analyticsController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/dashboard', authenticate, authorize('admin', 'librarian'), getDashboardStats);

export default router;

