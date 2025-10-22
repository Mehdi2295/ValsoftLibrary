import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { addDays, isPast } from 'date-fns';
import db from '../database/init';
import { Book, Loan } from '../types';

const LOAN_DURATION_DAYS = 14;

export const borrowBook = (req: Request, res: Response) => {
  try {
    const { bookId } = req.body;
    const userId = (req as any).user.id;

    if (!bookId) {
      return res.status(400).json({ error: 'Book ID is required' });
    }

    // Check if book exists and is available
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId) as Book | undefined;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    if (book.availableCopies <= 0) {
      return res.status(400).json({ error: 'Book is not available' });
    }

    // Check if user already has an active loan for this book
    const existingLoan = db.prepare(`
      SELECT * FROM loans
      WHERE book_id = ? AND user_id = ? AND status = 'active'
    `).get(bookId, userId);

    if (existingLoan) {
      return res.status(400).json({ error: 'You already have an active loan for this book' });
    }

    // Create loan
    const loanId = uuidv4();
    const borrowedAt = new Date().toISOString();
    const dueDate = addDays(new Date(), LOAN_DURATION_DAYS).toISOString();

    db.prepare(`
      INSERT INTO loans (id, book_id, user_id, borrowed_at, due_date, status)
      VALUES (?, ?, ?, ?, ?, 'active')
    `).run(loanId, bookId, userId, borrowedAt, dueDate);

    // Update available copies
    db.prepare(`
      UPDATE books SET available_copies = available_copies - 1
      WHERE id = ?
    `).run(bookId);

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    res.status(201).json(loan);
  } catch (error) {
    console.error('Borrow book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const returnBook = (req: Request, res: Response) => {
  try {
    const { loanId } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const loan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId) as Loan | undefined;
    if (!loan) {
      return res.status(404).json({ error: 'Loan not found' });
    }

    // Only the borrower or admin/librarian can return the book
    if (loan.userId !== userId && !['admin', 'librarian'].includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (loan.status === 'returned') {
      return res.status(400).json({ error: 'Book already returned' });
    }

    const returnedAt = new Date().toISOString();

    // Update loan status
    db.prepare(`
      UPDATE loans SET status = 'returned', returned_at = ?
      WHERE id = ?
    `).run(returnedAt, loanId);

    // Update available copies
    db.prepare(`
      UPDATE books SET available_copies = available_copies + 1
      WHERE id = ?
    `).run(loan.bookId);

    const updatedLoan = db.prepare('SELECT * FROM loans WHERE id = ?').get(loanId);
    res.json(updatedLoan);
  } catch (error) {
    console.error('Return book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMyLoans = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;

    let query = `
      SELECT l.*, b.title, b.author, b.cover_image
      FROM loans l
      JOIN books b ON l.book_id = b.id
      WHERE l.user_id = ?
    `;
    const params: any[] = [userId];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    query += ' ORDER BY l.borrowed_at DESC';

    const loans = db.prepare(query).all(...params);

    // Update overdue status
    const updatedLoans = (loans as any[]).map(loan => {
      if (loan.status === 'active' && isPast(new Date(loan.due_date))) {
        db.prepare(`UPDATE loans SET status = 'overdue' WHERE id = ?`).run(loan.id);
        return { ...loan, status: 'overdue' };
      }
      return loan;
    });

    res.json(updatedLoans);
  } catch (error) {
    console.error('Get my loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAllLoans = (req: Request, res: Response) => {
  try {
    const { status, userId } = req.query;

    let query = `
      SELECT l.*, b.title, b.author, b.cover_image, u.name as user_name, u.email as user_email
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      query += ' AND l.status = ?';
      params.push(status);
    }

    if (userId) {
      query += ' AND l.user_id = ?';
      params.push(userId);
    }

    query += ' ORDER BY l.borrowed_at DESC';

    const loans = db.prepare(query).all(...params);

    // Update overdue status
    const updatedLoans = (loans as any[]).map(loan => {
      if (loan.status === 'active' && isPast(new Date(loan.due_date))) {
        db.prepare(`UPDATE loans SET status = 'overdue' WHERE id = ?`).run(loan.id);
        return { ...loan, status: 'overdue' };
      }
      return loan;
    });

    res.json(updatedLoans);
  } catch (error) {
    console.error('Get all loans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

