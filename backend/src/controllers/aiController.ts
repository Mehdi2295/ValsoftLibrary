import { Request, Response } from 'express';
import db from '../database/init';
import { Book } from '../types';

// Simple AI-powered recommendations based on user's reading history and ratings
export const getRecommendations = (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;

    // Get user's highly rated books (4-5 stars)
    const userFavorites = db.prepare(`
      SELECT DISTINCT b.category, b.author, b.tags
      FROM reviews r
      JOIN books b ON r.book_id = b.id
      WHERE r.user_id = ? AND r.rating >= 4
    `).all(userId) as any[];

    // Get user's borrowed books
    const userBorrowedBooks = db.prepare(`
      SELECT DISTINCT book_id FROM loans WHERE user_id = ?
    `).all(userId) as any[];

    const borrowedBookIds = userBorrowedBooks.map((l: any) => l.book_id);

    // Extract categories and authors from favorites
    const favoriteCategories = [...new Set(userFavorites
      .map((f: any) => f.category)
      .filter((c: any) => c))];
    
    const favoriteAuthors = [...new Set(userFavorites
      .map((f: any) => f.author)
      .filter((a: any) => a))];

    let recommendations: any[] = [];

    // If user has favorites, recommend based on them
    if (favoriteCategories.length > 0 || favoriteAuthors.length > 0) {
      const categoryPlaceholders = favoriteCategories.map(() => '?').join(',');
      const authorPlaceholders = favoriteAuthors.map(() => '?').join(',');
      
      let query = 'SELECT * FROM books WHERE available_copies > 0';
      const params: any[] = [];

      if (favoriteCategories.length > 0) {
        query += ` AND (category IN (${categoryPlaceholders})`;
        params.push(...favoriteCategories);
        
        if (favoriteAuthors.length > 0) {
          query += ` OR author IN (${authorPlaceholders}))`;
          params.push(...favoriteAuthors);
        } else {
          query += ')';
        }
      } else if (favoriteAuthors.length > 0) {
        query += ` AND author IN (${authorPlaceholders})`;
        params.push(...favoriteAuthors);
      }

      // Exclude books user already borrowed
      if (borrowedBookIds.length > 0) {
        const borrowedPlaceholders = borrowedBookIds.map(() => '?').join(',');
        query += ` AND id NOT IN (${borrowedPlaceholders})`;
        params.push(...borrowedBookIds);
      }

      query += ' LIMIT 10';

      recommendations = db.prepare(query).all(...params) as Book[];
    }

    // If not enough recommendations, add popular books
    if (recommendations.length < 5) {
      let popularQuery = `
        SELECT b.*, COUNT(l.id) as loan_count,
               COALESCE(AVG(r.rating), 0) as avg_rating
        FROM books b
        LEFT JOIN loans l ON b.id = l.book_id
        LEFT JOIN reviews r ON b.id = r.book_id
        WHERE b.available_copies > 0
      `;
      const popularParams: any[] = [];

      if (borrowedBookIds.length > 0) {
        const borrowedPlaceholders = borrowedBookIds.map(() => '?').join(',');
        popularQuery += ` AND b.id NOT IN (${borrowedPlaceholders})`;
        popularParams.push(...borrowedBookIds);
      }

      popularQuery += `
        GROUP BY b.id
        ORDER BY loan_count DESC, avg_rating DESC
        LIMIT ?
      `;
      popularParams.push(10 - recommendations.length);

      const popularBooks = db.prepare(popularQuery).all(...popularParams);
      recommendations = [...recommendations, ...popularBooks];
    }

    // Add rating info to recommendations
    const recommendationsWithRatings = recommendations.map(book => {
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

    res.json(recommendationsWithRatings);
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// AI-powered smart search with fuzzy matching and relevance scoring
export const smartSearch = (req: Request, res: Response) => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);

    if (searchTerms.length === 0) {
      return res.json([]);
    }

    // Build a relevance score based on matches in different fields
    const books = db.prepare('SELECT * FROM books').all() as Book[];

    const scoredBooks = books.map(book => {
      let score = 0;
      const bookText = `${book.title} ${book.author} ${book.description || ''} ${book.tags || ''}`.toLowerCase();

      searchTerms.forEach(term => {
        // Title matches are worth more
        if (book.title.toLowerCase().includes(term)) {
          score += 10;
        }
        // Author matches
        if (book.author.toLowerCase().includes(term)) {
          score += 8;
        }
        // Description and tags matches
        if (bookText.includes(term)) {
          score += 3;
        }
      });

      // Boost available books
      if (book.availableCopies > 0) {
        score += 2;
      }

      return { ...book, relevanceScore: score };
    });

    // Filter books with score > 0 and sort by relevance
    const relevantBooks = scoredBooks
      .filter(book => book.relevanceScore > 0)
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 20);

    // Add rating info
    const booksWithRatings = relevantBooks.map(book => {
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
    console.error('Smart search error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Auto-categorize a book based on its title, author, and description
export const suggestCategory = (req: Request, res: Response) => {
  try {
    const { title, author, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const text = `${title} ${author || ''} ${description || ''}`.toLowerCase();

    // Simple keyword-based categorization
    const categoryKeywords: Record<string, string[]> = {
      'Fiction': ['novel', 'story', 'fiction', 'tale'],
      'Science Fiction': ['sci-fi', 'space', 'future', 'alien', 'robot', 'cyberpunk'],
      'Fantasy': ['fantasy', 'magic', 'wizard', 'dragon', 'elf', 'kingdom'],
      'Mystery': ['mystery', 'detective', 'crime', 'murder', 'investigation'],
      'Thriller': ['thriller', 'suspense', 'danger', 'conspiracy'],
      'Romance': ['romance', 'love', 'relationship', 'passion'],
      'Biography': ['biography', 'autobiography', 'memoir', 'life story'],
      'History': ['history', 'historical', 'war', 'ancient', 'medieval'],
      'Science': ['science', 'physics', 'biology', 'chemistry', 'research'],
      'Technology': ['technology', 'computer', 'programming', 'software', 'digital'],
      'Business': ['business', 'management', 'entrepreneur', 'marketing', 'finance'],
      'Self-Help': ['self-help', 'motivation', 'productivity', 'success', 'habit'],
      'Philosophy': ['philosophy', 'philosophical', 'ethics', 'moral'],
      'Psychology': ['psychology', 'mind', 'behavior', 'mental', 'cognitive'],
      'Children': ['children', 'kids', 'young', 'juvenile'],
      'Horror': ['horror', 'scary', 'ghost', 'haunted', 'terror'],
    };

    const categoryScores: Record<string, number> = {};

    Object.entries(categoryKeywords).forEach(([category, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (text.includes(keyword)) {
          score += 1;
        }
      });
      if (score > 0) {
        categoryScores[category] = score;
      }
    });

    // Get top 3 suggested categories
    const suggestions = Object.entries(categoryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([category, score]) => ({ category, confidence: score }));

    res.json({
      suggestions: suggestions.length > 0 ? suggestions : [{ category: 'General', confidence: 1 }],
    });
  } catch (error) {
    console.error('Suggest category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

