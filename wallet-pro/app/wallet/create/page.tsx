'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/components/context/AuthContext';
import { useWallets } from '@/hooks/useWallets';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CreateWalletPage() {
  const router = useRouter();
  const { token } = useAuthContext();
  const { createWallet, isLoading, error: createError } = useWallets();

  const [name, setName] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [description, setDescription] = useState('');
  const [initialBalance, setInitialBalance] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Wallet name is required');
      return;
    }

    try {
      await createWallet(token!, {
        name: name.trim(),
        currency,
        description: description.trim() || undefined,
        balance: initialBalance ? parseFloat(initialBalance) : 0,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wallet');
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
              <Link href="/dashboard">
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Create New Wallet</h1>
                <p className="text-muted-foreground">Add a new wallet to manage your funds</p>
              </div>
            </div>

            {/* Form Card */}
            <Card className="p-8 border-border/50">
              {error && (
                <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                    Wallet Name
                  </label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g., Savings, Emergency Fund"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                    className="h-10"
                  />
                  <p className="text-xs text-muted-foreground mt-2">Give your wallet a meaningful name</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="currency" className="block text-sm font-medium text-foreground mb-2">
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      disabled={isLoading}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm"
                    >
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="KES">KES - Kenyan Shilling</option>
                      <option value="TEZ">TEZ - Tanzanian Shilling</option>
                      <option value="CAD">CAD - Canadian Dollar</option>
                      <option value="AUD">AUD - Australian Dollar</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="balance" className="block text-sm font-medium text-foreground mb-2">
                      Initial Balance
                    </label>
                    <Input
                      id="balance"
                      type="number"
                      placeholder="0.00"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      disabled={isLoading}
                      min="0"
                      step="0.01"
                      className="h-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    placeholder="Add a description for this wallet..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={isLoading}
                    rows={4}
                    className="w-full px-3 py-2 rounded-md border border-input bg-background text-foreground text-sm resize-none"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground h-10"
                  >
                    {isLoading ? 'Creating...' : 'Create Wallet'}
                  </Button>
                  <Link href="/dashboard" className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
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
