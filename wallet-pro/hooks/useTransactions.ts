'use client';

import { useState, useCallback } from 'react';
import { Transaction, DepositInput, TransferInput, ApiResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UseTransactionsReturn {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  fetchTransactions: (token: string, walletId: string) => Promise<void>;
  deposit: (token: string, input: DepositInput) => Promise<Transaction>;
  transfer: (token: string, input: TransferInput) => Promise<Transaction>;
}

export function useTransactions(): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (token: string, walletId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Response:', response);

      if (!response.ok) throw new Error('Failed to fetch transactions');
      const data: ApiResponse<Transaction[]> = await response.json();
      setTransactions(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const deposit = useCallback(async (token: string, input: DepositInput): Promise<Transaction> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets/${input.walletId}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to deposit');
      const data: ApiResponse<Transaction> = await response.json();
      const transaction = data.data!;
      setTransactions(prev => [transaction, ...prev]);
      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transfer = useCallback(async (token: string, input: TransferInput): Promise<Transaction> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets/transfer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      if (!response.ok) throw new Error('Failed to transfer');
      const data: ApiResponse<Transaction> = await response.json();
      const transaction = data.data!;
      console.log('Transfer successful:', transaction);
      setTransactions(prev => [transaction, ...prev]);
      return transaction;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    transactions,
    isLoading,
    error,
    fetchTransactions,
    deposit,
    transfer,
  };
}
