#  Deployment Guide

This guide provides step-by-step instructions for deploying the Valsoft Library Management System to production.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Backend Deployment](#backend-deployment)
3. [Frontend Deployment](#frontend-deployment)
4. [Environment Variables](#environment-variables)
5. [Database Considerations](#database-considerations)

## Prerequisites

- Git repository with your code
- Node.js 18+ installed locally
- Production hosting accounts (see options below)

## Backend Deployment

### Option 1: Railway (Recommended)

Railway provides easy deployment with automatic HTTPS and environment management.

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize Project**
```bash
cd backend
railway init
```

4. **Set Environment Variables**
```bash
railway variables set PORT=5000
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your_production_secret_key_here
railway variables set JWT_EXPIRES_IN=7d
railway variables set DATABASE_PATH=./library.db
railway variables set CORS_ORIGIN=https://your-frontend-domain.com
```

5. **Deploy**
```bash
railway up
```

6. **Get Your URL**
```bash
railway domain
```

### Option 2: Render

1. **Create New Web Service**
   - Go to https://render.com
   - Click "New +" � "Web Service"
   - Connect your GitHub repository
   - Select the backend directory

2. **Configure Service**
   - **Name**: valsoft-library-backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

3. **Add Environment Variables**
   - PORT: 5000
   - NODE_ENV: production
   - JWT_SECRET: [generate a secure random string]
   - JWT_EXPIRES_IN: 7d
   - DATABASE_PATH: ./library.db
   - CORS_ORIGIN: https://your-frontend-domain.com

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment to complete

### Option 3: Heroku

1. **Install Heroku CLI**
```bash
npm install -g heroku
```

2. **Login**
```bash
heroku login
```

3. **Create App**
```bash
cd backend
heroku create valsoft-library-backend
```

4. **Set Environment Variables**
```bash
heroku config:set JWT_SECRET=your_production_secret_key
heroku config:set NODE_ENV=production
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set DATABASE_PATH=./library.db
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
```

5. **Deploy**
```bash
git push heroku main
```

6. **Seed Database**
```bash
heroku run npm run seed
```

## Frontend Deployment

### Option 1: Vercel (Recommended)

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login**
```bash
vercel login
```

3. **Update API Endpoint**
   
   Edit `frontend/src/lib/api.ts`:
   ```typescript
   const api = axios.create({
     baseURL: 'https://your-backend-url.com/api',
     // ... rest of config
   });
   ```

4. **Deploy**
```bash
cd frontend
vercel --prod
```

5. **Configure Project Settings**
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### Option 2: Netlify

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Update API Endpoint** (same as Vercel)

4. **Build**
```bash
cd frontend
npm run build
```

5. **Deploy**
```bash
netlify deploy --prod --dir=dist
```

### Option 3: GitHub Pages

1. **Update API Endpoint** (same as above)

2. **Install gh-pages**
```bash
cd frontend
npm install --save-dev gh-pages
```

3. **Add Deploy Script to package.json**
```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

4. **Configure vite.config.ts**
```typescript
export default defineConfig({
  base: '/ValsoftLibrary/',
  // ... rest of config
});
```

5. **Deploy**
```bash
npm run deploy
```

## Environment Variables

### Backend Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 5000 |
| NODE_ENV | Environment | production |
| JWT_SECRET | Secret key for JWT | random_secure_string_here |
| JWT_EXPIRES_IN | Token expiration | 7d |
| DATABASE_PATH | SQLite file path | ./library.db |
| CORS_ORIGIN | Frontend URL | https://your-app.vercel.app |

### Generating Secure JWT Secret

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 64
```

## Database Considerations

### SQLite (Default)

- Works great for small to medium deployments
- No additional setup required
- File-based, portable
- Suitable for up to 100,000 books and moderate traffic

**Note**: Some hosting platforms have ephemeral filesystems (files reset on restart). Consider:
- Railway: Persistent volumes available
- Render: Persistent disks available
- Heroku: Free tier has ephemeral storage (consider add-ons)

### Migrating to PostgreSQL (Optional for Production)

For larger deployments or platforms without persistent storage:

1. **Install PostgreSQL Packages**
```bash
npm install pg
```

2. **Update Database Code**
   - Replace better-sqlite3 with pg
   - Update queries for PostgreSQL syntax
   - Update schema creation

3. **Use Hosted PostgreSQL**
   - Heroku Postgres
   - Railway PostgreSQL
   - AWS RDS
   - Supabase

## Post-Deployment Steps

### 1. Seed Production Database

After first deployment, seed the database with initial data:

```bash
# If using Railway
railway run npm run seed

# If using Heroku
heroku run npm run seed

# If using Render (via SSH or one-time job)
```

### 2. Test Authentication

1. Try logging in with demo accounts
2. Create a new account
3. Test JWT token persistence

### 3. Update CORS Settings

Ensure backend CORS_ORIGIN matches your frontend domain exactly.

### 4. Test All Features

- Book browsing and search
- Book management (if admin)
- Borrowing and returning
- Reviews and ratings
- AI features
- Analytics dashboard

### 5. Monitor Logs

Check deployment platform logs for any errors:

```bash
# Railway
railway logs

# Heroku
heroku logs --tail

# Render
# Check logs in Render dashboard
```

## Security Checklist

- [ ] Change default JWT_SECRET to a secure random string
- [ ] Use HTTPS (most platforms provide this automatically)
- [ ] Set proper CORS_ORIGIN (don't use '*' in production)
- [ ] Keep dependencies updated
- [ ] Enable rate limiting if available on your platform
- [ ] Use environment variables for all secrets
- [ ] Don't commit .env files
- [ ] Review and limit API access if needed

## Performance Optimization

### Backend
- Enable gzip compression (most platforms do this)
- Set proper cache headers
- Use CDN for static assets if needed
- Monitor response times

### Frontend
- Ensure production build is used (`npm run build`)
- Verify code splitting is working
- Check bundle size (should be < 500KB)
- Enable HTTP/2 if available

## Custom Domain (Optional)

### For Vercel
```bash
vercel domains add yourdomain.com
```

### For Netlify
```bash
netlify domains:add yourdomain.com
```

### For Railway/Render/Heroku
Configure in the respective platform's dashboard under domain settings.

## Troubleshooting

### Backend Won't Start
- Check environment variables are set correctly
- Verify Node.js version (should be 18+)
- Check logs for specific errors
- Ensure all dependencies installed

### Frontend Can't Connect to Backend
- Verify API baseURL in api.ts
- Check CORS settings on backend
- Ensure backend is running and accessible
- Check browser console for errors

### Database Issues
- Verify DATABASE_PATH is correct
- Check write permissions for SQLite file
- Consider using PostgreSQL for production
- Ensure database is seeded

### Authentication Problems
- Verify JWT_SECRET is set and consistent
- Check token expiration settings
- Clear browser localStorage and try again
- Verify CORS includes credentials

## Monitoring & Maintenance

### Recommended Tools
- **Uptime Monitoring**: UptimeRobot, Pingdom
- **Error Tracking**: Sentry
- **Analytics**: Google Analytics, Plausible
- **Performance**: Lighthouse, WebPageTest

### Regular Maintenance
- Update dependencies monthly
- Review logs weekly
- Backup database regularly
- Monitor disk usage
- Check for security updates

## Cost Estimates

### Free Tier Options
- **Railway**: Free tier with $5 credit
- **Render**: Free tier available
- **Vercel**: Free for personal projects
- **Netlify**: Free tier with 100GB bandwidth

### Paid Recommendations
- **Railway**: $5-10/month
- **Render**: $7/month starter
- **Vercel**: Free to $20/month
- **Heroku**: $7/month hobby tier

## Support

For deployment issues:
1. Check platform-specific documentation
2. Review error logs
3. Verify environment variables
4. Check this deployment guide
5. Consult platform support if needed

---

**Your Valsoft Library is now ready for the world! **

