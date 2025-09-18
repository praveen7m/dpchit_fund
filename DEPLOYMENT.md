# Deployment Guide

## Backend Setup & Installation

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Install MongoDB
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Install and start MongoDB service

### 3. Start Backend
```bash
# Development
npm run dev

# Production
npm start
```

### 4. Start Frontend
```bash
cd dpchits-card-dash-main
npm install
npm run dev
```

## Production Deployment

### Backend (Railway/Heroku)
1. Create MongoDB Atlas database
2. Update `.env` with production MongoDB URI
3. Deploy to Railway/Heroku

### Frontend (Vercel/Netlify)
1. Update API_BASE_URL in `apiService.ts` to production backend URL
2. Build and deploy

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + JWT
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing

## Features
✅ User authentication (admin/user roles)
✅ Payment CRUD operations
✅ Real-time data synchronization
✅ Invoice generation with PDF export
✅ Data filtering and search
✅ Admin dashboard with statistics
✅ Permanent data storage in MongoDB