import { Router } from 'express';
import {
  borrowBook,
  returnBook,
  getMyLoans,
  getAllLoans,
} from '../controllers/loanController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/borrow', authenticate, borrowBook);
router.put('/return/:loanId', authenticate, returnBook);
router.get('/my-loans', authenticate, getMyLoans);
router.get('/all', authenticate, authorize('admin', 'librarian'), getAllLoans);

export default router;

