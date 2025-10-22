export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'librarian' | 'member';
  createdAt: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  publishedYear?: number;
  category?: string;
  description?: string;
  coverImage?: string;
  totalCopies: number;
  availableCopies: number;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  bookId: string;
  userId: string;
  borrowedAt: string;
  dueDate: string;
  returnedAt?: string;
  status: 'active' | 'returned' | 'overdue';
}

export interface Review {
  id: string;
  bookId: string;
  userId: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

