export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'librarian' | 'member';
  created_at?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  publisher?: string;
  published_year?: number;
  category?: string;
  description?: string;
  cover_image?: string;
  total_copies: number;
  available_copies: number;
  tags?: string;
  created_at: string;
  updated_at: string;
  averageRating?: number;
  reviewCount?: number;
}

export interface Loan {
  id: string;
  book_id: string;
  user_id: string;
  borrowed_at: string;
  due_date: string;
  returned_at?: string;
  status: 'active' | 'returned' | 'overdue';
  title?: string;
  author?: string;
  cover_image?: string;
  user_name?: string;
  user_email?: string;
}

export interface Review {
  id: string;
  book_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  user_name?: string;
}

export interface DashboardStats {
  stats: {
    totalBooks: number;
    availableBooks: number;
    totalUsers: number;
    activeLoans: number;
    overdueLoans: number;
  };
  popularBooks: any[];
  activeUsers: any[];
  recentLoans: Loan[];
  booksByCategory: any[];
}

