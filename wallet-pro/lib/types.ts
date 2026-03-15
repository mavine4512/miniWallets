/**
 * Type definitions for Mini Wallet application
 */

// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  name: string;
}

// Wallet Types
export interface Wallet {
  id: string;
  userId: string;
  name: string;
  balance: number;
  currency: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletInput {
  name: string;
  currency: string;
  description?: string;
  balance?: number;
}

// Transaction Types
export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

export interface Transaction {
  id: string;
  walletId: string;
  type: TransactionType;
  amount: number;
  description?: string;
  relatedWalletId?: string; // For transfers
  createdAt: string;
}

export interface DepositInput {
  walletId: string;
  amount: number;
  description?: string;
}

export interface TransferInput {
  fromWalletId: string;
  toWalletId: string;
  amount: number;
  description?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: AuthTokenResponse;
}

export interface WalletResponse {
  wallet: Wallet;
  transactions: Transaction[];
}

// Authentication State
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// UI State
export interface UiState {
  isLoading: boolean;
  error: string | null;
  success: string | null;
}
