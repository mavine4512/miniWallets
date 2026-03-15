# Neon PostgreSQL Setup Guide

## Creating a Neon PostgreSQL Database

### 1. Create Neon Account

1. Go to [Neon Console](https://console.neon.tech)
2. Sign up with email or GitHub
3. Create a new project

### 2. Create Database

1. In your Neon project dashboard, go to "Databases"
2. Create a new database called `wallet_db`
3. Select the appropriate region closest to your deployment location

### 3. Get Connection String

1. Go to "Connection String" in your project
2. Select "PostgreSQL" as the connection type
3. Copy the connection string in the format:
```
postgresql://username:password@ep-xxxxx.region.neon.tech/wallet_db?sslmode=require
```

4. Save this to your `.env` file as `DATABASE_URL`

## Important Notes

- Always include `?sslmode=require` at the end of your connection string
- Neon provides free tier with 3GB of storage and generous monthly compute hours
- Connection pooling is built-in with Neon

## Verifying Connection

After setting up your environment, test the connection:

```bash
npm run dev
```

You should see:
```
Database connected successfully
Server is running on port 3001
```

If you get connection errors:
- Check that DATABASE_URL is correctly copied
- Verify Neon project is active (check dashboard)
- Ensure `?sslmode=require` is in the connection string
- Check firewall/VPN isn't blocking connections

## Database Schema

When the API starts with `synchronize: true` (development mode), TypeORM automatically creates these tables:

- **users** - User accounts with email, name, and hashed password
- **wallets** - User wallets with names, balances, and currencies
- **transactions** - Transaction history with types (DEPOSIT, TRANSFER_IN, TRANSFER_OUT)

## Production Considerations

For production:
1. Set `synchronize: false` in database config
2. Create migrations: `npm run migration:generate -- src/migrations/Production`
3. Run migrations: `npm run migration:run`
4. Use a strong JWT_SECRET (at least 32 random characters)
5. Set `NODE_ENV=production`
