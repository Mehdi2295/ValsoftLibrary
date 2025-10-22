import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import db, { initDatabase } from '../database/init';

dotenv.config();

const seedData = async () => {
  console.log('🌱 Seeding database...');

  initDatabase();

  // Create admin user
  const adminId = uuidv4();
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  db.prepare(`
    INSERT INTO users (id, email, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(adminId, 'admin@library.com', adminPassword, 'Admin User', 'admin');

  // Create librarian user
  const librarianId = uuidv4();
  const librarianPassword = await bcrypt.hash('librarian123', 10);
  
  db.prepare(`
    INSERT INTO users (id, email, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(librarianId, 'librarian@library.com', librarianPassword, 'Librarian User', 'librarian');

  // Create member user
  const memberId = uuidv4();
  const memberPassword = await bcrypt.hash('member123', 10);
  
  db.prepare(`
    INSERT INTO users (id, email, password, name, role)
    VALUES (?, ?, ?, ?, ?)
  `).run(memberId, 'member@library.com', memberPassword, 'Member User', 'member');

  console.log('✅ Users created');

  // Sample books
  const books = [
    {
      title: 'The Great Gatsby',
      author: 'F. Scott Fitzgerald',
      isbn: '978-0743273565',
      publisher: 'Scribner',
      publishedYear: 1925,
      category: 'Fiction',
      description: 'A classic American novel set in the Jazz Age.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 3,
      tags: 'classic,american,jazz-age',
    },
    {
      title: '1984',
      author: 'George Orwell',
      isbn: '978-0451524935',
      publisher: 'Signet Classic',
      publishedYear: 1949,
      category: 'Science Fiction',
      description: 'A dystopian social science fiction novel.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 5,
      tags: 'dystopian,politics,surveillance',
    },
    {
      title: 'To Kill a Mockingbird',
      author: 'Harper Lee',
      isbn: '978-0060935467',
      publisher: 'Harper Perennial',
      publishedYear: 1960,
      category: 'Fiction',
      description: 'A gripping tale of racial injustice and childhood innocence.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 4,
      tags: 'classic,justice,coming-of-age',
    },
    {
      title: 'Harry Potter and the Philosopher\'s Stone',
      author: 'J.K. Rowling',
      isbn: '978-0439708180',
      publisher: 'Scholastic',
      publishedYear: 1997,
      category: 'Fantasy',
      description: 'The first book in the Harry Potter series.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 6,
      tags: 'magic,adventure,young-adult',
    },
    {
      title: 'The Hobbit',
      author: 'J.R.R. Tolkien',
      isbn: '978-0547928227',
      publisher: 'Houghton Mifflin',
      publishedYear: 1937,
      category: 'Fantasy',
      description: 'A fantasy adventure about a hobbit\'s journey.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 3,
      tags: 'fantasy,adventure,middle-earth',
    },
    {
      title: 'Pride and Prejudice',
      author: 'Jane Austen',
      isbn: '978-0141439518',
      publisher: 'Penguin Classics',
      publishedYear: 1813,
      category: 'Romance',
      description: 'A romantic novel of manners.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 2,
      tags: 'romance,classic,regency',
    },
    {
      title: 'The Catcher in the Rye',
      author: 'J.D. Salinger',
      isbn: '978-0316769488',
      publisher: 'Little, Brown and Company',
      publishedYear: 1951,
      category: 'Fiction',
      description: 'A story about teenage rebellion and alienation.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 3,
      tags: 'coming-of-age,classic,teenage',
    },
    {
      title: 'The Lord of the Rings',
      author: 'J.R.R. Tolkien',
      isbn: '978-0544003415',
      publisher: 'Houghton Mifflin',
      publishedYear: 1954,
      category: 'Fantasy',
      description: 'An epic high fantasy trilogy.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 4,
      tags: 'fantasy,epic,adventure',
    },
    {
      title: 'Brave New World',
      author: 'Aldous Huxley',
      isbn: '978-0060850524',
      publisher: 'Harper Perennial',
      publishedYear: 1932,
      category: 'Science Fiction',
      description: 'A dystopian novel set in a futuristic World State.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 2,
      tags: 'dystopian,future,society',
    },
    {
      title: 'The Da Vinci Code',
      author: 'Dan Brown',
      isbn: '978-0307474278',
      publisher: 'Doubleday',
      publishedYear: 2003,
      category: 'Mystery',
      description: 'A mystery thriller novel.',
      coverImage: 'https://covers.openlibrary.org/b/id/7222246-L.jpg',
      totalCopies: 5,
      tags: 'mystery,thriller,conspiracy',
    },
  ];

  books.forEach(book => {
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
      book.title,
      book.author,
      book.isbn,
      book.publisher,
      book.publishedYear,
      book.category,
      book.description,
      book.coverImage,
      book.totalCopies,
      book.totalCopies,
      book.tags,
      now,
      now
    );
  });

  console.log('✅ Books created');
  console.log('\n📝 Test Users:');
  console.log('  Admin: admin@library.com / admin123');
  console.log('  Librarian: librarian@library.com / librarian123');
  console.log('  Member: member@library.com / member123');
  console.log('\n✨ Database seeded successfully!');
};

seedData().catch(error => {
  console.error('Error seeding database:', error);
  process.exit(1);
});

