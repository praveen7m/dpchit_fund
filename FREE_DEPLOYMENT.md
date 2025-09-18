# Free Deployment Guide - Make Your Project Live

## Step 1: Deploy Backend (Render - Free)

### 1.1 Prepare Backend
- Go to [render.com](https://render.com)
- Sign up with GitHub account
- Click "New +" → "Web Service"
- Connect your GitHub repository

### 1.2 Backend Settings
```
Build Command: npm install
Start Command: npm start
Environment: Node
```

### 1.3 Environment Variables (Add these in Render dashboard)
```
PORT=5000
MONGODB_URI=mongodb+srv://dpuser:dppass123@cluster0.mt5jv.mongodb.net/dpchits?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

### 1.4 Deploy
- Click "Create Web Service"
- Wait 5-10 minutes for deployment
- Copy your backend URL (e.g., `https://your-app.onrender.com`)

## Step 2: Deploy Frontend (Vercel - Free)

### 2.1 Prepare Frontend
- Go to [vercel.com](https://vercel.com)
- Sign up with GitHub account
- Click "New Project"
- Import your repository
- Select `dpchits-card-dash-main` folder

### 2.2 Environment Variables (Add in Vercel dashboard)
```
VITE_API_URL=https://your-backend-url.onrender.com/api
```

### 2.3 Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Your app will be live at `https://your-app.vercel.app`

## Step 3: Test Your Live Application

### 3.1 Access Your App
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-backend.onrender.com/api`

### 3.2 Test Features
- ✅ Login (admin: admin/admin123)
- ✅ User registration
- ✅ Payment creation
- ✅ Invoice generation
- ✅ Data persistence

## Free Tier Limitations
- **Render**: Backend sleeps after 15 min inactivity (wakes up in 30 seconds)
- **Vercel**: Unlimited static hosting
- **MongoDB Atlas**: 512MB free storage

## Your App Will Be Fully Functional
- All features work exactly like localhost
- Data persists permanently in MongoDB Atlas
- Professional URLs for sharing
- HTTPS security included

## Total Cost: $0/month