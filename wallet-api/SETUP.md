# Wallet API - Setup Instructions

## Prerequisites
- Node.js (v16+)
- PostgreSQL (v12+) or Neon PostgreSQL account
- npm or yarn

## Step 1: Set up Neon PostgreSQL Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Select PostgreSQL version and region
4. Create a new database named `wallet_db` (or any name you prefer)
5. Get your DATABASE_URL from the connection string

The connection string will look like:
```
postgresql://username:password@ep-xxx.region.neon.tech/wallet_db?sslmode=require
```

## Step 2: Install Dependencies

```bash
cd wallet-api
npm install
```

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

2. Update `.env` with your values:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.region.neon.tech/wallet_db?sslmode=require
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_EXPIRY=7d
REFRESH_TOKEN_EXPIRY=30d
PORT=3001
NODE_ENV=development
```

## Step 4: Create Database Tables

TypeORM will automatically create tables on first run (synchronize: true in development). If you prefer manual migrations:

```bash
npm run migration:generate -- src/migrations/InitialMigration
npm run migration:run
```

## Step 5: Start the Server

```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (requires token)

### Wallets
- `POST /api/wallets` - Create a new wallet (requires token)
- `GET /api/wallets` - Get all wallets for user (requires token)
- `GET /api/wallets/:walletId` - Get specific wallet (requires token)
- `PUT /api/wallets/:walletId` - Update wallet (requires token)
- `DELETE /api/wallets/:walletId` - Delete wallet (requires token)

### Transactions
- `POST /api/wallets/:walletId/deposit` - Deposit funds (requires token)
- `POST /api/wallets/transfer` - Transfer between wallets (requires token)

## Example Requests

### Register
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "password123"
  }'
```

### Create Wallet
```bash
curl -X POST http://localhost:3001/api/wallets \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Wallet",
    "description": "My primary wallet",
    "currency": "USD",
    "balance": 1000
  }'
```

### Deposit
```bash
curl -X POST http://localhost:3001/api/wallets/:walletId/deposit \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 500,
    "description": "Monthly deposit"
  }'
```

### Transfer
```bash
curl -X POST http://localhost:3001/api/wallets/transfer \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "fromWalletId": "wallet1-id",
    "toWalletId": "wallet2-id",
    "amount": 100,
    "description": "Transfer to friend"
  }'
```

## Project Structure

```
wallet-api/
├── src/
│   ├── config/
│   │   └── database.ts         # Database configuration
│   ├── controllers/
│   │   ├── AuthController.ts   # Auth controller
│   │   └── WalletController.ts # Wallet controller
│   ├── entities/
│   │   ├── User.ts             # User entity
│   │   ├── Wallet.ts           # Wallet entity
│   │   └── Transaction.ts      # Transaction entity
│   ├── middleware/
│   │   ├── auth.ts             # JWT authentication
│   │   ├── validation.ts       # Request validation
│   │   └── errorHandler.ts     # Error handling
│   ├── routes/
│   │   ├── authRoutes.ts       # Auth routes
│   │   └── walletRoutes.ts     # Wallet routes
│   ├── schemas/
│   │   └── validation.ts       # Zod schemas
│   ├── services/
│   │   ├── AuthService.ts      # Auth business logic
│   │   └── WalletService.ts    # Wallet business logic
│   └── index.ts                # Main app file
├── .env.example                # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

## Troubleshooting

### Connection refused error
- Make sure your Neon database is active
- Check your DATABASE_URL is correct
- Ensure `?sslmode=require` is added to the connection string

### JWT errors
- Ensure JWT_SECRET is at least 32 characters
- Check that the token is being sent in the Authorization header as `Bearer TOKEN`

### Port already in use
- Change PORT in .env to a different port (e.g., 3002)
- Or kill the process using port 3001: `lsof -ti:3001 | xargs kill -9`

## Development

### Watch mode
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Start production build
```bash
npm run build
npm start
```

## Next Steps

1. Connect the frontend to this API by updating `NEXT_PUBLIC_API_URL` to `http://localhost:3001`
2. Update the hooks in the frontend to use real API endpoints instead of mock data
3. Deploy to production (Vercel, Railway, Heroku, etc.)
