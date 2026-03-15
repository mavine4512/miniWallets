import { z } from 'zod';

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const CreateWalletSchema = z.object({
  name: z.string().min(1, 'Wallet name is required'),
  description: z.string().optional(),
  currency: z.string().default('USD'),
  balance: z.number().min(0, 'Initial balance cannot be negative').optional(),
});

export const DepositSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

export const TransferSchema = z.object({
  fromWalletId: z.string().uuid('Invalid wallet ID'),
  toWalletId: z.string().uuid('Invalid wallet ID'),
  amount: z.number().positive('Amount must be greater than 0'),
  description: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateWalletInput = z.infer<typeof CreateWalletSchema>;
export type DepositInput = z.infer<typeof DepositSchema>;
export type TransferInput = z.infer<typeof TransferSchema>;
