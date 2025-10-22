import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../database/init';
import { Book } from '../types';

export const getAllBooks = (req: Request, res: Response) => {
  try {
    const { search, category, author, available } = req.query;
    
    let query = 'SELECT * FROM books WHERE 1=1';
    const params: any[] = [];

    if (search) {
      query += ' AND (title LIKE ? OR author LIKE ? OR description LIKE ?)';
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    if (author) {
      query += ' AND author LIKE ?';
      params.push(`%${author}%`);
    }

    if (available === 'true') {
      query += ' AND available_copies > 0';
    }

    query += ' ORDER BY created_at DESC';

    const books = db.prepare(query).all(...params);

    // Get average ratings for each book
    const booksWithRatings = (books as Book[]).map(book => {
      const ratingData = db.prepare(`
        SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
        FROM reviews WHERE book_id = ?
      `).get(book.id) as any;

      return {
        ...book,
        averageRating: ratingData?.avgRating || null,
        reviewCount: ratingData?.reviewCount || 0,
      };
    });

    res.json(booksWithRatings);
  } catch (error) {
    console.error('Get books error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getBookById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Get average rating
    const ratingData = db.prepare(`
      SELECT AVG(rating) as avgRating, COUNT(*) as reviewCount
      FROM reviews WHERE book_id = ?
    `).get(id) as any;

    res.json({
      ...book,
      averageRating: ratingData?.avgRating || null,
      reviewCount: ratingData?.reviewCount || 0,
    });
  } catch (error) {
    console.error('Get book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createBook = (req: Request, res: Response) => {
  try {
    const {
      title,
      author,
      isbn,
      publisher,
      publishedYear,
      category,
      description,
      coverImage,
      totalCopies = 1,
      tags,
    } = req.body;

    if (!title || !author) {
      return res.status(400).json({ error: 'Title and author are required' });
    }

    const bookId = uuidv4();
    const now = new Date().toISOString();

    db.prepare(`
      INSERT INTO books (
        id, title, author, isbn, publisher, published_year,
        category, description, cover_image, total_copies,
        available_copies, tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      bookId,
      title,
      author,
      isbn || null,
      publisher || null,
      publishedYear || null,
      category || null,
      description || null,
      coverImage || null,
      totalCopies,
      totalCopies,
      tags || null,
      now,
      now
    );

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(bookId);
    res.status(201).json(book);
  } catch (error) {
    console.error('Create book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateBook = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      title,
      author,
      isbn,
      publisher,
      publishedYear,
      category,
      description,
      coverImage,
      totalCopies,
      tags,
    } = req.body;

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id) as Book;
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    const now = new Date().toISOString();
    const availableCopiesDiff = totalCopies ? totalCopies - book.totalCopies : 0;

    db.prepare(`
      UPDATE books SET
        title = ?,
        author = ?,
        isbn = ?,
        publisher = ?,
        published_year = ?,
        category = ?,
        description = ?,
        cover_image = ?,
        total_copies = ?,
        available_copies = ?,
        tags = ?,
        updated_at = ?
      WHERE id = ?
    `).run(
      title || book.title,
      author || book.author,
      isbn !== undefined ? isbn : book.isbn,
      publisher !== undefined ? publisher : book.publisher,
      publishedYear !== undefined ? publishedYear : book.publishedYear,
      category !== undefined ? category : book.category,
      description !== undefined ? description : book.description,
      coverImage !== undefined ? coverImage : book.coverImage,
      totalCopies || book.totalCopies,
      book.availableCopies + availableCopiesDiff,
      tags !== undefined ? tags : book.tags,
      now,
      id
    );

    const updatedBook = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    res.json(updatedBook);
  } catch (error) {
    console.error('Update book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteBook = (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
    if (!book) {
      return res.status(404).json({ error: 'Book not found' });
    }

    // Check if there are active loans
    const activeLoans = db.prepare(`
      SELECT COUNT(*) as count FROM loans
      WHERE book_id = ? AND status = 'active'
    `).get(id) as any;

    if (activeLoans.count > 0) {
      return res.status(400).json({ error: 'Cannot delete book with active loans' });
    }

    db.prepare('DELETE FROM books WHERE id = ?').run(id);
    res.json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Delete book error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getCategories = (req: Request, res: Response) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category FROM books
      WHERE category IS NOT NULL
      ORDER BY category
    `).all();

    res.json(categories.map((c: any) => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

