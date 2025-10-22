import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';

export const createReview = (req: Request, res: Response) => {
  try {
    const { bookId, rating, comment } = req.body;
    const userId = (req as any).user.id;

    if (!bookId || !rating) {
      return res.status(400).json({ error: 'Book ID and rating are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    // Check if book exists
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if user already reviewed this book
    const existingReview = db.prepare(`
      SELECT * FROM reviews WHERE book_id = ? AND user_id = ?
    `).get(bookId, userId);

    if (existingReview) {
      // Update existing review
      db.prepare(`
        UPDATE reviews SET rating = ?, comment = ?
        WHERE book_id = ? AND user_id = ?
      `).run(rating, comment || null, bookId, userId);

      const updatedReview = db.prepare(`
        SELECT r.*, u.name as user_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.book_id = ? AND r.user_id = ?
      `).get(bookId, userId);

      return res.json(updatedReview);
    }

    // Create new review
    const reviewId = uuidv4();
    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO reviews (id, book_id, user_id, rating, comment, created_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(reviewId, bookId, userId, rating, comment || null, createdAt);

    const review = db.prepare(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ?
    `).get(reviewId);

    res.status(201).json(review);
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookReviews = (req: Request, res: Response) => {
  try {
    const { bookId } = req.params;

    const reviews = db.prepare(`
      SELECT r.*, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.book_id = ?
      ORDER BY r.created_at DESC
    `).all(bookId);

    res.json(reviews);
  } catch (error) {
    console.error('Get book reviews error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteReview = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const userRole = (req as any).user.role;

    const review = db.prepare('SELECT * FROM reviews WHERE id = ?').get(id) as any;
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Only the review author or admin can delete
    if (review.user_id !== userId && userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    db.prepare('DELETE FROM reviews WHERE id = ?').run(id);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

