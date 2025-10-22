import { Router } from 'express';
import {
  getRecommendations,
  smartSearch,
  suggestCategory,
} from '../controllers/aiController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/recommendations', authenticate, getRecommendations);
router.get('/smart-search', smartSearch);
router.post('/suggest-category', authenticate, suggestCategory);

export default router;

