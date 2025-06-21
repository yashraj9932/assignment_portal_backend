# Assignment Portal - Deployment Guide

This guide explains how to deploy the full-stack Assignment Portal application to Vercel.

## Project Structure

- **Backend**: Node.js/Express API server (`server.js`)
- **Frontend**: Angular application (`client/` directory)
- **Database**: MongoDB (configured via environment variables)

## Deployment Configuration

### Vercel Configuration (`vercel.json`)

The project uses a monorepo configuration that:
1. Builds the Angular frontend for production
2. Deploys the Node.js backend as serverless functions
3. Serves the frontend from the root and API routes from `/api/*`

### Environment Variables

Set these environment variables in your Vercel dashboard:

```
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=https://your-domain.vercel.app
```

### Build Process

1. **Frontend Build**: Angular app builds to `client/dist/client/`
2. **Backend**: Node.js server runs as serverless function
3. **Static Files**: Angular build files served from root
4. **API Routes**: All API calls prefixed with `/api`

## Local Development

### Backend
```bash
npm run dev
```

### Frontend
```bash
cd client
npm start
```

### Production Build
```bash
npm run build:all
```

## API Endpoints

All API endpoints are now prefixed with `/api`:

- `/api/student/*` - Student routes
- `/api/teacher/*` - Teacher routes  
- `/api/assignment/*` - Assignment routes

## Deployment Steps

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables** in Vercel dashboard

5. **Redeploy** if needed:
   ```bash
   vercel --prod
   ```

## Important Notes

- The Angular app automatically uses production environment when built
- API calls in production use relative URLs (`/api/*`)
- File uploads are handled by the backend serverless function
- CORS is configured for both development and production URLs

## Troubleshooting

- Ensure all environment variables are set in Vercel
- Check that MongoDB connection string is accessible from Vercel
- Verify JWT secret is properly configured
- Monitor Vercel function logs for any runtime errors 