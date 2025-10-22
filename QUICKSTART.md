# Quick Start Guide

Get the Valsoft Library Management System running in 5 minutes!

## Prerequisites

Ensure you have installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)

Check your versions:
```bash
node --version  # should be v18.0.0 or higher
npm --version   # should be 8.0.0 or higher
```

## Step-by-Step Setup

### 1. Clone & Navigate
```bash
git clone <your-repo-url>
cd ValsoftLibrary
```

### 2. Install All Dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### 3. Setup Backend Environment
```bash
cd backend
cat > .env << EOL
PORT=5000
NODE_ENV=development
JWT_SECRET=dev_secret_key_change_in_production
JWT_EXPIRES_IN=7d
DATABASE_PATH=./library.db
CORS_ORIGIN=http://localhost:5173
EOL
cd ..
```

### 4. Seed the Database
```bash
cd backend
npm run seed
cd ..
```

You should see:
```
� Seeding database...
� Users created
� Books created

 Test Users:
  Admin: admin@library.com / admin123
  Librarian: librarian@library.com / librarian123
  Member: member@library.com / member123

 Database seeded successfully!
```

### 5. Start the Application
```bash
npm run dev
```

This will start both backend and frontend simultaneously.

### 6. Open Your Browser

Navigate to: **http://localhost:5173**

### 7. Login

Use any of these test accounts:

| Role | Email | Password |
|------|-------|----------|
| � Admin | admin@library.com | admin123 |
|  Librarian | librarian@library.com | librarian123 |
|  Member | member@library.com | member123 |

## What You Can Do

### As Admin or Librarian:
- Add, edit, and delete books  
- View analytics dashboard  
- Manage all loans  
- View all user activities  

### As Member (or Admin/Librarian):
- Browse and search books  
- Borrow available books  
- Return borrowed books  
- Rate and review books  
- Get AI-powered recommendations  
- Use smart search  

## Quick Tour

1. **Home Page** - Browse recent books and features
2. **Books** - Search and filter the entire library
3. **Book Details** - Click any book to see details, reviews, and borrow
4. **My Loans** - View your borrowed books and due dates
5. **AI Features** - Get recommendations and use smart search
6. **Dashboard** (Admin/Librarian) - View statistics and analytics

## Troubleshooting

### Port Already in Use?

**Backend (5000):**
```bash
# Find and kill process on port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in backend/.env
PORT=5001
```

**Frontend (5173):**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Database Issues?

Delete and recreate:
```bash
cd backend
rm library.db
npm run seed
cd ..
```

### Module Not Found?

Reinstall dependencies:
```bash
rm -rf node_modules
rm -rf backend/node_modules
rm -rf frontend/node_modules
npm install
cd backend && npm install
cd ../frontend && npm install
cd ..
```

### Backend Won't Start?

Check if .env file exists:
```bash
ls backend/.env
# If not found, create it (see step 3 above)
```

### Frontend Won't Connect?

1. Verify backend is running (http://localhost:5000/api/health should return `{"status":"ok"}`)
2. Check CORS_ORIGIN in backend/.env
3. Clear browser cache and localStorage

## Running Separately

If you prefer to run backend and frontend in separate terminals:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Next Steps

1. **Explore Features** - Try all the features as different user roles
2. **Add Your Books** - Login as admin and add some books
3. **Test Workflows** - Borrow books, return them, add reviews
4. **Check Analytics** - View the dashboard as admin
5. **Try AI Features** - Get recommendations and use smart search

## API Testing

Backend API is available at: **http://localhost:5000/api**

Health check:
```bash
curl http://localhost:5000/api/health
```

Login:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@library.com","password":"admin123"}'
```

## Development Tips

### Hot Reload
Both backend and frontend support hot reload - just save your changes!

### View Logs
Backend logs appear in the terminal where you ran `npm run dev`

### Database Browser
Use any SQLite browser to inspect the database:
- [DB Browser for SQLite](https://sqlitebrowser.org/)
- [TablePlus](https://tableplus.com/)
- VS Code SQLite extension

### API Testing
Use tools like:
- [Postman](https://www.postman.com/)
- [Insomnia](https://insomnia.rest/)
- [Thunder Client](https://www.thunderclient.com/) (VS Code extension)

## Common Commands

```bash
# Install everything
npm run install:all

# Start everything
npm run dev

# Build everything
npm run build

# Backend only
cd backend
npm run dev      # Development
npm run build    # Build
npm start        # Production
npm run seed     # Seed database

# Frontend only
cd frontend
npm run dev      # Development
npm run build    # Build
npm run preview  # Preview production build
```

## File Structure Overview

```
ValsoftLibrary/
 backend/           # Node.js/Express API
�    src/
�   �    controllers/   # Route handlers
�   �    routes/        # API routes
�   �    database/      # DB setup
�   �    middleware/    # Auth, etc.
�    library.db     # SQLite database (created after seed)
�
 frontend/          # React/Vite app
�    src/
�   �    pages/         # Page components
�   �    components/    # Reusable components
�   �    lib/           # Utilities
�   �    store/         # State management
�    dist/          # Build output (after npm run build)
�
 README.md         # Full documentation
```

## Need Help?

- Check [README.md](./README.md) for detailed documentation
- See [FEATURES.md](./FEATURES.md) for feature details
- Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment

---

**You're all set! Happy coding! **

