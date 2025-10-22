import { Request, Response } from 'express';
import db from '../database/init';

export const getDashboardStats = (req: Request, res: Response) => {
  try {
    // Total books
    const totalBooksResult = db.prepare('SELECT COUNT(*) as count FROM books').get() as any;
    const totalBooks = totalBooksResult.count;

    // Total available books
    const availableBooksResult = db.prepare(
      'SELECT SUM(available_copies) as count FROM books'
    ).get() as any;
    const availableBooks = availableBooksResult.count || 0;

    // Total users
    const totalUsersResult = db.prepare('SELECT COUNT(*) as count FROM users').get() as any;
    const totalUsers = totalUsersResult.count;

    // Active loans
    const activeLoansResult = db.prepare(
      "SELECT COUNT(*) as count FROM loans WHERE status = 'active' OR status = 'overdue'"
    ).get() as any;
    const activeLoans = activeLoansResult.count;

    // Overdue loans
    const overdueLoansResult = db.prepare(
      "SELECT COUNT(*) as count FROM loans WHERE status = 'overdue'"
    ).get() as any;
    const overdueLoans = overdueLoansResult.count;

    // Most popular books (by loan count)
    const popularBooks = db.prepare(`
      SELECT b.id, b.title, b.author, b.cover_image, COUNT(l.id) as loan_count
      FROM books b
      LEFT JOIN loans l ON b.id = l.book_id
      GROUP BY b.id
      ORDER BY loan_count DESC
      LIMIT 5
    `).all();

    // Most active users (by loan count)
    const activeUsers = db.prepare(`
      SELECT u.id, u.name, u.email, COUNT(l.id) as loan_count
      FROM users u
      LEFT JOIN loans l ON u.id = l.user_id
      WHERE u.role = 'member'
      GROUP BY u.id
      ORDER BY loan_count DESC
      LIMIT 5
    `).all();

    // Recent activity
    const recentLoans = db.prepare(`
      SELECT l.*, b.title, b.author, u.name as user_name
      FROM loans l
      JOIN books b ON l.book_id = b.id
      JOIN users u ON l.user_id = u.id
      ORDER BY l.borrowed_at DESC
      LIMIT 10
    `).all();

    // Books by category
    const booksByCategory = db.prepare(`
      SELECT category, COUNT(*) as count
      FROM books
      WHERE category IS NOT NULL
      GROUP BY category
      ORDER BY count DESC
    `).all();

    res.json({
      stats: {
        totalBooks,
        availableBooks,
        totalUsers,
        activeLoans,
        overdueLoans,
      },
      popularBooks,
      activeUsers,
      recentLoans,
      booksByCategory,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

