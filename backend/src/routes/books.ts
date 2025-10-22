import { Router } from 'express';
import {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getCategories,
} from '../controllers/bookController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', getAllBooks);
router.get('/categories', getCategories);
router.get('/:id', getBookById);
router.post('/', authenticate, authorize('admin', 'librarian'), createBook);
router.put('/:id', authenticate, authorize('admin', 'librarian'), updateBook);
router.delete('/:id', authenticate, authorize('admin', 'librarian'), deleteBook);

export default router;

