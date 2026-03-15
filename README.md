# Wallet Pro - Full Stack Wallet Management Application

A complete full-stack web application for managing multiple wallets with secure authentication, transactions, deposits, and transfers.

## Project Overview

Wallet Pro is a modern wallet management system built with Next.js 15+ frontend and Express.js backend. Users can create multiple wallets in different currencies, deposit funds, transfer money between wallets, and track all transactions in real-time.

## Features

### Frontend (Next.js)
- User authentication with JWT tokens
- Dashboard with total balance overview
- Create and manage multiple wallets
- Deposit funds into wallets
- Transfer funds between wallets
- View wallet details and transaction history
- Responsive design with Tailwind CSS
- Protected routes with authentication

### Backend (Express.js)
- User registration and login with JWT authentication
- Wallet management (CRUD operations)
- Transaction tracking (deposits and transfers)
- Input validation with Zod
- Error handling middleware
- CORS support for frontend integration
- PostgreSQL database with TypeORM

## Tech Stack

### Frontend
- Next.js 15+ - React framework
- TypeScript - Type-safe development
- Tailwind CSS - Utility-first CSS
- shadcn/ui - Component library
- React Context API - State management

### Backend
- Express.js - Web framework
- TypeScript - Type-safe development
- PostgreSQL - Database (Neon)
- TypeORM - ORM for database operations
- JWT - Authentication
- bcrypt - Password hashing
- Zod - Schema validation

## Project Structure

```
wallet-pro/
├── app/                          # Next.js app directory
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── dashboard/               # Dashboard page
│   ├── wallet/
│   │   ├── create/              # Create wallet page
│   │   ├── [id]/                # Wallet details page
│   │   │   ├── deposit/         # Deposit page
│   │   │   └── transfer/        # Transfer page
│   │   └── layout.tsx           # Wallet layout
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── Header.tsx               # Header component
│   ├── ProtectedRoute.tsx        # Route protection
│   ├── WalletCard.tsx            # Wallet display card
│   └── ui/                       # shadcn/ui components
├── context/
│   └── AuthContext.tsx           # Authentication context
├── hooks/
│   ├── useWallets.ts            # Wallet operations
│   └── useTransactions.ts        # Transaction operations
├── lib/
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Utility functions
├── wallet-api/                  # Express backend
│   │   ├── config/              # Database config
│   │   ├── controllers/         # Request handlers
│   │   ├── entities/            # Database models
│   │   ├── middleware/          # Middleware
│   │   ├── routes/              # API routes
│   │   ├── schemas/             # Validation schemas
│   │   └── index.ts             # App entry point
│   ├── .env                     # Environment variables
│   ├── package.json
│   └── tsconfig.json
├── README.md                    # This file
└── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon PostgreSQL account (or any PostgreSQL database)

### 1. Frontend Setup

```bash
# Navigate to wallet-api
cd wallet-pro
# Install dependencies
npm install

# Set environment variables
# Create .env.local file in root:
NEXT_PUBLIC_API_URL=http://localhost:3001

# Start development server
npm run dev
```

Frontend will run on `http://localhost:3000`

### 2. Backend Setup

```bash
# Navigate to wallet-api
cd wallet-api

# Install dependencies
npm install

# Create .env file (copy from .env.example):
cp .env.example .env

# Update .env with your database credentials:
DATABASE_URL=postgresql://username:password@host/database
JWT_SECRET=your-secret-key-min-32-chars
JWT_EXPIRY=7d
PORT=3001
NODE_ENV=development

# Start development server
npm run dev
```

Backend will run on `http://localhost:3001`

## Database Setup

### Option 1: Using Neon PostgreSQL (Recommended)

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Create a database named `neondb`
4. Copy the connection string to your `.env` file in `wallet-api/`
5. URL encode any special characters in the password (e.g., `_` becomes `%5F`)

### Option 2: Local PostgreSQL

1. Create a database: `createdb wallet_db`
2. Set connection string: `postgresql://user:password@localhost/wallet_db`

Tables will be automatically created on first run due to `synchronize: true` in development mode.

## API Documentation

### Authentication Endpoints

#### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "password123"
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "token...",
    "refreshToken": "token...",
    "userId": "user-id"
  }
}
```

#### Get Profile
```bash
GET /api/auth/profile
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Wallet Endpoints

#### Create Wallet
```bash
POST /api/wallets
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Wedding Fund",
  "description": "Saving for wedding",
  "currency": "KES",
  "balance": 50000
}
```

#### Get All Wallets
```bash
GET /api/wallets
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Get Wallet Details
```bash
GET /api/wallets/:walletId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

#### Update Wallet
```bash
PUT /api/wallets/:walletId
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Delete Wallet
```bash
DELETE /api/wallets/:walletId
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Transaction Endpoints

#### Deposit Funds
```bash
POST /api/wallets/:walletId/deposit
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "amount": 10000,
  "description": "Salary deposit"
}
```

#### Transfer Funds
```bash
POST /api/wallets/transfer
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json

{
  "fromWalletId": "wallet-id-1",
  "toWalletId": "wallet-id-2",
  "amount": 5000,
  "description": "Transfer to friend"
}
```

#### Get Transactions
```bash
GET /api/wallets/:walletId/transactions
Authorization: Bearer YOUR_ACCESS_TOKEN
```

## Development

### Frontend
```bash
# Start dev server with hot reload
npm run dev

# Build for production
npm run build

# Start production build
npm start
```

### Backend
```bash
cd wallet-api

# Start dev server
npm run dev

# Build TypeScript
npm run build

# Run production build
npm start

# Synchronize database schema
npm run migrate
```

## Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### Backend (wallet-api/.env)
```env
DATABASE_URL=postgresql://user:password@host/database
JWT_SECRET=your-secret-key-minimum-32-characters-long
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
PORT=3001
NODE_ENV=development
```

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- For Neon, ensure `?sslmode=require` is included
- Check that special characters in password are URL encoded (e.g., `%5F` for `_`)

### Frontend Not Connecting to Backend
- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` environment variable
- Verify CORS is enabled in backend

### JWT Errors
- Ensure JWT_SECRET is at least 32 characters
- Verify token is sent as `Authorization: Bearer TOKEN`

### Port Already in Use
- Frontend (3000): `lsof -ti:3000 | xargs kill -9`
- Backend (3001): `lsof -ti:3001 | xargs kill -9`

## Testing with Postman

See `wallet-api/POSTMAN_GUIDE.md` for complete Postman testing guide with all endpoint examples and use cases.

## Additional Documentation

- `wallet-api/SETUP.md` - Detailed backend setup guide
- `wallet-api/POSTMAN_GUIDE.md` - Postman testing guide
- `wallet-api/DATABASE_SETUP.md` - Database schema documentation

## Deployment

### Deploy Frontend to Vercel
```bash
# Connect your GitHub repository to Vercel
# Vercel will automatically deploy on push

# Or manually:
npm run build
npm install -g vercel
vercel
```

### Deploy Backend
- Railway
- Heroku
- AWS EC2
- DigitalOcean
- Any Node.js hosting provider

Update `NEXT_PUBLIC_API_URL` to your production backend URL.

## License

MIT License - Feel free to use this project for personal or commercial use.

## Support

For issues or questions, check the troubleshooting section or review the detailed setup guides in the wallet-api directory.
