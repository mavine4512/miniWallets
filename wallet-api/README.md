# Wallet API

Professional wallet management backend built with Express.js, TypeScript, and PostgreSQL.

## Features

- User authentication with JWT
- Multiple wallet management
- Transaction history tracking
- Deposit and transfer operations
- TypeORM database ORM
- Input validation with Zod
- Error handling middleware
- CORS support

## Tech Stack

- Express.js - Web framework
- TypeScript - Type-safe development
- PostgreSQL - Database (via Neon)
- TypeORM - Object-relational mapping
- JWT - Authentication
- bcrypt - Password hashing
- Zod - Schema validation

## Quick Start

1. **Setup Database**: See [SETUP.md](./SETUP.md) for detailed Neon PostgreSQL setup
2. **Install Dependencies**: `npm install`
3. **Configure Environment**: Copy `.env.example` to `.env` and fill in values
4. **Start Development Server**: `npm run dev`

The API will run on `http://localhost:3001`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/profile` - Get current user profile

### Wallet Endpoints
- `POST /api/wallets` - Create wallet
- `GET /api/wallets` - List user wallets
- `GET /api/wallets/:walletId` - Get wallet details
- `PUT /api/wallets/:walletId` - Update wallet
- `DELETE /api/wallets/:walletId` - Delete wallet

### Transaction Endpoints
- `POST /api/wallets/:walletId/deposit` - Deposit funds
- `POST /api/wallets/transfer` - Transfer between wallets

## Project Structure

```
src/
├── config/      # Database configuration
├── controllers/ # Request handlers
├── entities/    # Database models
├── middleware/  # Auth, validation, error handling
├── routes/      # API routes
├── schemas/     # Zod validation schemas
├── services/    # Business logic
└── index.ts     # Application entry point
```

## Development

- **Dev Server**: `npm run dev` - Start with hot reload
- **Build**: `npm run build` - Compile TypeScript to JavaScript
- **Production**: `npm start` - Run compiled JavaScript

## Environment Variables

```env
DATABASE_URL=postgresql://...           # Neon PostgreSQL connection string
JWT_SECRET=your-secret-key             # Minimum 32 characters
JWT_EXPIRY=7d                          # Access token expiry
REFRESH_TOKEN_EXPIRY=30d               # Refresh token expiry
PORT=3001                              # Server port
NODE_ENV=development                   # Environment
```

## For More Information

See [SETUP.md](./SETUP.md) for detailed setup instructions and examples.
