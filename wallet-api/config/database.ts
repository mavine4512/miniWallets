import 'dotenv/config';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { Wallet } from '../entities/Wallet';
import { Transaction } from '../entities/Transaction';

const isDevelopment = process.env.NODE_ENV === 'development';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: isDevelopment,
  logging: isDevelopment ? ['query', 'error', 'warn'] : ['error'],
  entities: [User, Wallet, Transaction],
  migrations: ['src/migrations/*.ts'],
  subscribers: [],
  ssl: {
    rejectUnauthorized: false,
  },
});
