import { Router } from 'express';
import {
  createReview,
  getBookReviews,
  deleteReview,
} from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createReview);
router.get('/book/:bookId', getBookReviews);
router.delete('/:id', authenticate, deleteReview);

export default router;

