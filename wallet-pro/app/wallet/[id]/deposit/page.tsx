'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/context/AuthContext';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function DepositPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;

  const { token } = useAuthContext();
  const { wallets, fetchWallets } = useWallets();
  const { deposit, isLoading } = useTransactions();

  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Wrap in useCallback so the reference stays stable across renders
  const loadWallets = useCallback(() => {
    if (token) fetchWallets(token);
  }, [token]);

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const wallet = wallets.find(w => w.id === walletId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      await deposit(token!, {
        walletId,
        amount: amountNum,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/wallet/${walletId}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit');
    }
  };

  if (!wallet) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="p-12 text-center border-border/50">
              <h3 className="text-lg font-semibold text-foreground">Wallet not found</h3>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl">

            <div className="flex items-center gap-4 mb-8">
              <Link href={`/wallet/${walletId}`}>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Deposit to {wallet.name}</h1>
                <p className="text-muted-foreground">Add funds to your wallet</p>
              </div>
            </div>

            {success && (
              <Card className="p-8 mb-6 bg-green-50 border-green-200">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Deposit Successful!</h3>
                    <p className="text-green-700">Redirecting you back...</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-8 border-border/50">
              {error && !success && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-2">
                    Amount ({wallet.currency})
                  </label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={isLoading || success}
                    min="0.01"
                    step="0.01"
                    className="h-10 text-lg"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Current balance: {wallet.currency} {Number(wallet.balance).toFixed(2)}
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    placeholder="e.g., Monthly savings, Bonus payment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading || success}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm resize-none"
                  />
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Wallet:</span>
                      <span className="text-foreground font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deposit Amount:</span>
                      <span className="text-foreground font-medium">
                        {amount || '0.00'} {wallet.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-foreground font-medium">New Balance:</span>
                      <span className="text-foreground font-bold">
                        {wallet.currency} {(Number(wallet.balance) + (parseFloat(amount) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  >
                    {isLoading ? 'Processing...' : success ? 'Done!' : 'Deposit'}
                  </Button>
                  <Link href={`/wallet/${walletId}`} className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isLoading}
                      className="w-full h-10"
                    >
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}