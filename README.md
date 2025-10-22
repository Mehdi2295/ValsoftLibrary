# Valsoft Library Management System

A modern, full-stack library management system with AI-powered features, built with React, TypeScript, Node.js, and Express.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![React](https://img.shields.io/badge/react-18.2.0-blue.svg)

## Features

### Core Features
- **Book Management**: Add, edit, delete, and search books with comprehensive metadata
- **Check-in/Check-out System**: Seamless borrowing and returning of books
- **Advanced Search**: Find books by title, author, category, or description
- **Ratings & Reviews**: Users can rate and review books
- **Analytics Dashboard**: Real-time statistics and insights (Admin/Librarian only)

### AI-Powered Features
- **Smart Recommendations**: Personalized book suggestions based on reading history
- **Semantic Search**: Context-aware search that understands meaning
- **Auto-Categorization**: AI suggests categories when adding new books

### User Management
- **Authentication**: JWT-based authentication system
- **Role-Based Access Control**: Three user roles (Admin, Librarian, Member)
- **Responsive Design**: Beautiful UI that works on all devices

### Extra Features
- **Due Date Tracking**: Automatic overdue detection
- **Popular Books**: Track most borrowed books
- **User Reading History**: Complete loan history for each user
- **Modern UI/UX**: Clean, intuitive interface with Tailwind CSS
- **Fast & Efficient**: Optimized with SQLite database

## Technology Stack

### Backend
- **Node.js** with **Express** - REST API server
- **TypeScript** - Type-safe development
- **SQLite** with **better-sqlite3** - Lightweight, fast database
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **React Router** - Client-side routing
- **Zustand** - State management
- **Tailwind CSS** - Utility-first styling
- **Axios** - HTTP client
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons

## Prerequisites

- **Node.js** (v18 or higher)
- **npm** (v8 or higher)

## Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ValsoftLibrary
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 3. Configure Environment Variables

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./library.db
CORS_ORIGIN=http://localhost:5173
```

### 4. Seed the Database

```bash
cd backend
npm run seed
```

This will create:
- Sample books
- Test user accounts (see credentials below)

### 5. Start the Application

**Option 1: Run Both Backend and Frontend Together (Recommended)**
```bash
# From the root directory
npm run dev
```

**Option 2: Run Separately**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## Default User Accounts

After seeding the database, you can login with:

| Role       | Email                    | Password      |
|------------|--------------------------|---------------|
| Admin      | admin@library.com        | admin123      |
| Librarian  | librarian@library.com    | librarian123  |
| Member     | member@library.com       | member123     |

## API Documentation

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "member"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Book Endpoints

#### Get All Books
```http
GET /api/books?search=<query>&category=<category>&author=<author>&available=true
```

#### Get Book by ID
```http
GET /api/books/:id
```

#### Create Book (Admin/Librarian only)
```http
POST /api/books
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "isbn": "978-0-123456-78-9",
  "publisher": "Publisher Name",
  "publishedYear": 2023,
  "category": "Fiction",
  "description": "Book description",
  "totalCopies": 5,
  "tags": "fiction,adventure"
}
```

#### Update Book (Admin/Librarian only)
```http
PUT /api/books/:id
Authorization: Bearer <token>
Content-Type: application/json
```

#### Delete Book (Admin/Librarian only)
```http
DELETE /api/books/:id
Authorization: Bearer <token>
```

### Loan Endpoints

#### Borrow Book
```http
POST /api/loans/borrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book-uuid"
}
```

#### Return Book
```http
PUT /api/loans/return/:loanId
Authorization: Bearer <token>
```

#### Get My Loans
```http
GET /api/loans/my-loans?status=<active|returned|overdue>
Authorization: Bearer <token>
```

#### Get All Loans (Admin/Librarian only)
```http
GET /api/loans/all?status=<status>&userId=<userId>
Authorization: Bearer <token>
```

### Review Endpoints

#### Create/Update Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": "book-uuid",
  "rating": 5,
  "comment": "Great book!"
}
```

#### Get Book Reviews
```http
GET /api/reviews/book/:bookId
```

### AI Endpoints

#### Get Recommendations
```http
GET /api/ai/recommendations
Authorization: Bearer <token>
```

#### Smart Search
```http
GET /api/ai/smart-search?query=<search-query>
```

#### Suggest Category
```http
POST /api/ai/suggest-category
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Book Title",
  "author": "Author Name",
  "description": "Book description"
}
```

### Analytics Endpoints

#### Get Dashboard Stats (Admin/Librarian only)
```http
GET /api/analytics/dashboard
Authorization: Bearer <token>
```

## User Roles & Permissions

### Admin
- Full access to all features
- Manage books (create, edit, delete)
- View analytics dashboard
- Manage all loans
- Access all user data

### Librarian
- Manage books (create, edit, delete)
- View analytics dashboard
- Manage all loans
- Cannot manage users

### Member
- Browse and search books
- Borrow and return books
- Rate and review books
- View personal loan history
- Get AI recommendations

## Project Structure

```
ValsoftLibrary/
 backend/
�    src/
�   �    controllers/      # Request handlers
�   �    database/          # Database initialization
�   �    middleware/        # Auth middleware
�   �    routes/            # API routes
�   �    scripts/           # Seed scripts
�   �    types/             # TypeScript types
�   �    index.ts           # Server entry point
�    package.json
�    tsconfig.json
 frontend/
�    src/
�   �    components/        # React components
�   �    pages/             # Page components
�   �    lib/               # Utilities & API client
�   �    store/             # State management
�   �    types/             # TypeScript types
�   �    App.tsx            # Main app component
�   �    main.tsx           # Entry point
�    package.json
�    vite.config.ts
�    tailwind.config.js
 package.json               # Root package.json
 README.md
```

## Available Scripts

### Root Directory
- `npm run dev` - Start both backend and frontend
- `npm run build` - Build both backend and frontend
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only

### Backend
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run seed` - Seed database with sample data

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Key Features Breakdown

### 1. Book Management
- CRUD operations for books
- Rich metadata (ISBN, publisher, year, category, description)
- Cover image support
- Multiple copies tracking
- Tags for better organization

### 2. Loan System
- 14-day loan period
- Automatic overdue detection
- Availability tracking
- Loan history
- Return processing

### 3. AI Features
- **Smart Recommendations**: Analyzes user's reading history and preferences
- **Semantic Search**: Relevance-based scoring across title, author, and description
- **Auto-Categorization**: Keyword-based category suggestions

### 4. Analytics Dashboard
- Total books and availability metrics
- Active and overdue loans tracking
- Popular books ranking
- Active users statistics
- Recent activity feed
- Books distribution by category

### 5. User Experience
- Clean, modern interface
- Mobile-responsive design
- Real-time notifications
- Intuitive navigation
- Fast search and filtering

## Deployment

### Deploy on Railway (Free)

1) Push your repo to GitHub (already done).

2) In Railway:
- Create New Project → Deploy from GitHub → select this repo
- Add variables under Project → Variables:
  - `PORT=3001`
  - `CORS_ORIGIN=https://yourdomain.com,https://your-railway-url.up.railway.app`
  - `JWT_SECRET` (any strong value)
  - `JWT_EXPIRES_IN=7d`

3) Build and Start Commands are auto from `railway.json` and root scripts.

4) Domain:
- Railway → Settings → Custom Domain → add your domain
- In your DNS provider, add a CNAME to Railway’s provided host

5) Frontend API URL:
- In Railway, add variable on the frontend service (or project):
  - `VITE_API_URL=https://yourdomain.com` (no trailing slash)

6) Re-deploy. Visit `https://yourdomain.com`.

### Backend Deployment

1. Build the backend:
```bash
cd backend
npm run build
```

2. Set production environment variables

3. Deploy to your hosting platform (Heroku, Railway, Render, etc.)

### Frontend Deployment

1. Update API endpoint in `frontend/src/lib/api.ts`

2. Build the frontend:
```bash
cd frontend
npm run build
```

3. Deploy the `dist` folder to:
   - Vercel
   - Netlify
   - GitHub Pages
   - Any static hosting service

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- CORS configuration
- Helmet.js security headers
- Input validation
- SQL injection prevention

## Testing

The application includes:
- Type safety with TypeScript
- Input validation
- Error handling
- Database constraints

## Performance

- Optimized database queries with indexes
- Lightweight SQLite database
- Fast Vite build tool
- Efficient state management
- Code splitting with React Router

## Contributing

This project was built as a demonstration for the Valsoft Library Management System challenge.

## License

This project is licensed under the MIT License.

## Developer

Built with  by Mehdi Chekkaf using cursor
## Acknowledgments

- React and the React team
- Express.js community
- All open-source contributors

---

## Support

For questions or issues, please open an issue in the repository.

## Features Implemented

� Complete book management system  
� Check-in/check-out functionality  
� Advanced search and filtering  
� JWT authentication with role-based access  
� AI-powered recommendations  
� Smart semantic search  
� Auto-categorization  
� Analytics dashboard  
� Ratings and reviews  
� Modern, responsive UI  
� Complete API documentation  
� Comprehensive README  

**Status**: Production Ready

