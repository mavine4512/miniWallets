'use client';

import { useState, useCallback, useEffect } from 'react';
import { Wallet, CreateWalletInput, ApiResponse } from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface UseWalletsReturn {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  fetchWallets: (token: string) => Promise<void>;
  createWallet: (token: string, input: CreateWalletInput) => Promise<Wallet>;
  updateWallet: (token: string, walletId: string, input: Partial<CreateWalletInput>) => Promise<Wallet>;
  deleteWallet: (token: string, walletId: string) => Promise<void>;
}

export function useWallets(): UseWalletsReturn {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWallets = useCallback(async (token: string) => {
    setIsLoading(true);
    setError(null);
    console.log(' Fetching wallets with token:', token);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to fetch wallets');
      const data: ApiResponse<Wallet[]> = await response.json();
      setWallets(data.data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.log(' Error fetching wallets:', message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createWallet = useCallback(async (token: string, input: CreateWalletInput): Promise<Wallet> => {
    setIsLoading(true);
    setError(null);
    try {
      console.log(' Creating wallet with input:', input);
      const response = await fetch(`${API_BASE_URL}/wallets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      });

      const responseText = await response.text();

      if (!response.ok) throw new Error(`Failed to create wallet: ${responseText}`);
      const data: ApiResponse<Wallet> = JSON.parse(responseText);
      const newWallet = data.data!;
      console.log(' Wallet created successfully:', newWallet);
      setWallets(prev => [...prev, newWallet]);
      return newWallet;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      console.log(' Error creating wallet:', message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateWallet = useCallback(
    async (token: string, walletId: string, input: Partial<CreateWalletInput>): Promise<Wallet> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/wallets/${walletId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(input),
        });

        if (!response.ok) throw new Error('Failed to update wallet');
        const data: ApiResponse<Wallet> = await response.json();
        const updated = data.data!;
        setWallets(prev => prev.map(w => (w.id === walletId ? updated : w)));
        return updated;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An error occurred';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const deleteWallet = useCallback(async (token: string, walletId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/wallets/${walletId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error('Failed to delete wallet');
      setWallets(prev => prev.filter(w => w.id !== walletId));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    wallets,
    isLoading,
    error,
    fetchWallets,
    createWallet,
    updateWallet,
    deleteWallet,
  };
}