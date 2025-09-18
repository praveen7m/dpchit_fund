# DPChits Backend API

Node.js backend with MongoDB for DPChits Fund Management System.

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Install MongoDB
Download and install MongoDB from https://www.mongodb.com/try/download/community

### 3. Start MongoDB
```bash
mongod
```

### 4. Environment Setup
Update `.env` file with your MongoDB connection string:
```
MONGODB_URI=mongodb://localhost:27017/dpchits
```

### 5. Start Backend Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

Server runs on http://localhost:5000

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register user
- POST `/api/auth/login` - Login user

### Payments
- GET `/api/payments` - Get all payments (admin only)
- GET `/api/payments/my-payments` - Get user's payments
- POST `/api/payments` - Create payment
- DELETE `/api/payments/:id` - Delete payment
- GET `/api/payments/stats` - Get payment statistics (admin only)

## Frontend Integration

Update frontend API base URL in `src/services/apiService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:5000/api';
```