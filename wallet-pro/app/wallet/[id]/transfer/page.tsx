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

export default function TransferPage() {
  const params = useParams();
  const router = useRouter();
  const walletId = params.id as string;

  const { token } = useAuthContext();
  const { wallets, fetchWallets } = useWallets();
  const { transfer, isLoading } = useTransactions();

  const [toWalletId, setToWalletId] = useState('');
  const [transferMode, setTransferMode] = useState<'wallet' | 'id'>('wallet');
  const [manualWalletId, setManualWalletId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const wallet = wallets.find(w => w.id === walletId);
  const toWallet = wallets.find(w => w.id === toWalletId);
  const availableWallets = wallets.filter(w => w.id !== walletId);
  const finalToWalletId = transferMode === 'wallet' ? toWalletId : manualWalletId;

  const loadWallets = useCallback(() => {
    if (token) fetchWallets(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadWallets();
  }, [loadWallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!finalToWalletId) {
      setError('Please select or enter a destination wallet');
      return;
    }

    if (finalToWalletId === walletId) {
      setError('You cannot transfer to the same wallet');
      return;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (amountNum > Number(wallet!.balance)) {
      setError('Insufficient balance for this transfer');
      return;
    }

    try {
      await transfer(token!, {
        fromWalletId: walletId,
        toWalletId: finalToWalletId,
        amount: amountNum,
        description: description.trim() || undefined,
      });
      setSuccess(true);
      setTimeout(() => router.push(`/wallet/${walletId}`), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to transfer');
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

  if (availableWallets.length === 0 && transferMode === 'wallet') {
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
                <h1 className="text-2xl font-bold text-foreground">Transfer Funds</h1>
              </div>
              <Card className="p-8 border-border/50 text-center">
                <p className="text-muted-foreground mb-4">
                  You need at least 2 wallets to transfer funds
                </p>
                <Link href="/wallet/create">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Create Another Wallet
                  </Button>
                </Link>
              </Card>
            </div>
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
                <h1 className="text-3xl font-bold text-foreground">Transfer Funds</h1>
                <p className="text-muted-foreground">Transfer money between wallets</p>
              </div>
            </div>

            {success && (
              <Card className="p-8 mb-6 bg-green-50 border-green-200">
                <div className="flex items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-green-600 flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-900">Transfer Successful!</h3>
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

                {/* Transfer To */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-3">
                    Transfer To
                  </label>

                  {/* Mode toggle */}
                  <div className="flex gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => { setTransferMode('wallet'); setToWalletId(''); setManualWalletId(''); }}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        transferMode === 'wallet'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Your Wallets
                    </button>
                    <button
                      type="button"
                      onClick={() => { setTransferMode('id'); setToWalletId(''); setManualWalletId(''); }}
                      className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        transferMode === 'id'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      Other User
                    </button>
                  </div>

                  {/* Wallet selector or manual ID input */}
                  {transferMode === 'wallet' ? (
                    <select
                      value={toWalletId}
                      onChange={(e) => setToWalletId(e.target.value)}
                      disabled={isLoading || success}
                      className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                      <option value="">Select a wallet</option>
                      {availableWallets.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.currency}) — {w.currency} {Number(w.balance).toFixed(2)}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Input
                      type="text"
                      placeholder="Enter wallet ID (UUID)"
                      value={manualWalletId}
                      onChange={(e) => setManualWalletId(e.target.value)}
                      disabled={isLoading || success}
                      className="h-10"
                    />
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    Available: {wallet.currency} {Number(wallet.balance).toFixed(2)}
                  </p>
                </div>

                {/* Amount */}
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
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    placeholder="e.g., Transfer to savings..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading || success}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm resize-none"
                  />
                </div>

                {/* Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-2">Summary</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">From:</span>
                      <span className="text-foreground font-medium">{wallet.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">To:</span>
                      <span className="text-foreground font-medium">
                        {transferMode === 'wallet'
                          ? (toWallet?.name || 'Select wallet')
                          : (manualWalletId || 'Enter wallet ID')}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Amount:</span>
                      <span className="text-foreground font-medium">
                        {amount || '0.00'} {wallet.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-border">
                      <span className="text-foreground font-medium">New Balance:</span>
                      <span className="text-foreground font-bold">
                        {wallet.currency} {(Number(wallet.balance) - (parseFloat(amount) || 0)).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading || success}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  >
                    {isLoading ? 'Processing...' : success ? 'Done!' : 'Transfer'}
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