# Wallet API - Database Schema

This document describes the complete database structure for the Wallet API.

## Overview

The database consists of three main entities with the following relationships:
- **User** (1) ←→ (Many) **Wallet**
- **Wallet** (1) ←→ (Many) **Transaction**

---

## Entity Models

### 1. User Entity

**Table Name:** `users`

**Purpose:** Stores user account information and authentication credentials.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| `id` | UUID | Primary Key | Unique user identifier, auto-generated |
| `email` | VARCHAR | UNIQUE, NOT NULL | User email address (unique per user) |
| `name` | VARCHAR | NOT NULL | User's full name |
| `password` | VARCHAR | NOT NULL | Hashed password (bcrypt) |
| `createdAt` | TIMESTAMP | NOT NULL | Account creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last account update timestamp |

**Relationships:**
- One User can have Many Wallets (1:N)
- Cascade delete enabled: deleting a user deletes all associated wallets

**TypeORM Entity File:** `src/entities/User.ts`

---

### 2. Wallet Entity

**Table Name:** `wallets`

**Purpose:** Represents a wallet belonging to a user, storing balance and metadata.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| `id` | UUID | Primary Key | Unique wallet identifier, auto-generated |
| `name` | VARCHAR | NOT NULL | Wallet name (e.g., "Main Wallet", "Savings") |
| `description` | VARCHAR | NULLABLE | Optional wallet description |
| `balance` | DECIMAL(15,2) | NOT NULL, Default 0 | Current wallet balance with 2 decimal places |
| `currency` | VARCHAR | NOT NULL, Default 'USD' | Currency code (USD, EUR, etc.) |
| `ownerId` | UUID | Foreign Key | References Users.id, NOT NULL |
| `createdAt` | TIMESTAMP | NOT NULL | Wallet creation timestamp |
| `updatedAt` | TIMESTAMP | NOT NULL | Last wallet update timestamp |

**Foreign Keys:**
- `ownerId` → `users.id` (CASCADE on delete)

**Relationships:**
- Many Wallets belong to One User (N:1)
- One Wallet has Many Transactions (1:N)
- Cascade delete enabled for transactions

**TypeORM Entity File:** `src/entities/Wallet.ts`

---

### 3. Transaction Entity

**Table Name:** `transactions`

**Purpose:** Records all financial transactions (deposits and transfers) for audit trail and balance history.

**Columns:**

| Column | Type | Constraints | Description |
|--------|------|-----------|-------------|
| `id` | UUID | Primary Key | Unique transaction identifier, auto-generated |
| `type` | VARCHAR | NOT NULL, ENUM | Transaction type: DEPOSIT, TRANSFER_OUT, TRANSFER_IN |
| `amount` | DECIMAL(15,2) | NOT NULL | Transaction amount with 2 decimal places |
| `description` | VARCHAR | NULLABLE | Optional transaction description |
| `walletId` | UUID | Foreign Key | References Wallets.id, NOT NULL |
| `relatedWalletId` | UUID | NULLABLE | References Wallets.id for transfers (source/destination) |
| `createdAt` | TIMESTAMP | NOT NULL | Transaction timestamp |

**Foreign Keys:**
- `walletId` → `wallets.id` (CASCADE on delete)

**Relationships:**
- Many Transactions belong to One Wallet (N:1)
- Related wallets linked via `relatedWalletId` for transfer tracking

**TypeORM Entity File:** `src/entities/Transaction.ts`

**Transaction Types:**
- `DEPOSIT`: Money added to wallet
- `TRANSFER_OUT`: Money sent from wallet
- `TRANSFER_IN`: Money received into wallet

---

## Database Relationships Diagram

```
┌─────────────────────┐
│       USERS         │
├─────────────────────┤
│ id (PK, UUID)       │
│ email (UNIQUE)      │
│ name                │
│ password (hashed)   │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ 1:N (owner)
           │
┌──────────▼──────────┐
│      WALLETS        │
├─────────────────────┤
│ id (PK, UUID)       │
│ name                │
│ description         │
│ balance             │
│ currency            │
│ ownerId (FK)        │
│ createdAt           │
│ updatedAt           │
└──────────┬──────────┘
           │
           │ 1:N (wallet)
           │
┌──────────▼──────────────┐
│    TRANSACTIONS         │
├─────────────────────────┤
│ id (PK, UUID)           │
│ type (ENUM)             │
│ amount                  │
│ description             │
│ walletId (FK)           │
│ relatedWalletId (FK)    │
│ createdAt               │
└─────────────────────────┘
```

---

## Business Logic Flows

### Deposit Flow
1. User initiates deposit to Wallet A
2. Wallet A balance increases by amount
3. DEPOSIT transaction record created
4. Transaction linked to Wallet A

### Transfer Flow
1. User initiates transfer from Wallet A to Wallet B
2. Wallet A balance decreases by amount
3. Wallet B balance increases by amount
4. TRANSFER_OUT transaction created for Wallet A
5. TRANSFER_IN transaction created for Wallet B
6. Both transactions linked via `relatedWalletId`

---

## Data Constraints & Validation

- **Balance:** Always decimal with 2 decimal places (e.g., 100.50)
- **Precision:** Up to 15 total digits, 2 decimal places (supports up to $9,999,999,999,999.99)
- **Email:** Must be unique across all users
- **Password:** Stored as bcrypt hashes (never plain text)
- **Cascade Deletes:** Deleting a user or wallet automatically deletes related records
- **Transaction Immutability:** Transactions are created but never updated/deleted (audit trail)

---

## Indexes

- `users.email` - UNIQUE index for fast email lookups during login
- `wallets.ownerId` - Foreign key index for user's wallets queries
- `transactions.walletId` - Foreign key index for wallet transaction queries
- `transactions.relatedWalletId` - Foreign key index for transfer tracking

---

## Entity Location

All TypeORM entities are located in: `/wallet-api/src/entities/`

Files:
- `User.ts` - User entity definition
- `Wallet.ts` - Wallet entity definition  
- `Transaction.ts` - Transaction entity definition
