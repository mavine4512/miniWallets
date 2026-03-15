'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/components/context/AuthContext';
import { useWallets } from '@/hooks/useWallets';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { WalletCard } from '@/components/WalletCard';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Wallet as WalletIcon, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { user, token } = useAuthContext();
  const { wallets, isLoading, fetchWallets } = useWallets();
   const [balancesByPrimary, setBalancesByPrimary] = useState<Map<string, number>>(new Map());

  useEffect(() => {
    if (token) {
      fetchWallets(token);
    }
  }, [token, fetchWallets]);

  useEffect(() => {
    // Group balances by currency
    const grouped = new Map<string, number>();
    wallets.forEach(wallet => {
      const current = grouped.get(wallet.currency) || 0;
      grouped.set(wallet.currency, current + Number(wallet.balance));
    });
    setBalancesByPrimary(grouped);
  }, [wallets]);

   const primaryCurrency = wallets.length > 0 ? wallets[0].currency : 'KES';
  const primaryBalance = balancesByPrimary.get(primaryCurrency) || 0;

  const handleCreateWallet = () => {
    // Navigate to create wallet page
    window.location.href = '/wallet/create';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user?.name}</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6 border-primary/30 bg-gradient-to-br from-primary/10 to-primary/5 hover:border-primary/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Total Balance</p>
                <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <WalletIcon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent mb-2">
                {new Intl.NumberFormat('en-US', {
                  style: 'currency',
                  currency: primaryCurrency,
                }).format(primaryBalance)}
              </p>
              <p className="text-xs text-muted-foreground">
                Across {wallets.length} wallet{wallets.length !== 1 ? 's' : ''}({primaryCurrency})
              </p>
            </Card>

            <Card className="p-6 border-secondary/30 bg-gradient-to-br from-secondary/10 to-secondary/5 hover:border-secondary/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Active Wallets</p>
                <div className="w-10 h-10 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent mb-2">
                {wallets.length}
              </p>
              <p className="text-xs text-muted-foreground">
                Ready to manage
              </p>
            </Card>

            <Card className="p-6 border-accent/30 bg-gradient-to-br from-accent/10 to-accent/5 hover:border-accent/50 transition-all">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-muted-foreground">Quick Action</p>
                <div className="w-10 h-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
              </div>
              <Button
                onClick={handleCreateWallet}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Wallet
              </Button>
            </Card>
          </div>

            {/* Wallets Section */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-foreground">Your Wallets</h2>
              <Link href="/wallet/create">
                <Button className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wallet
                </Button>
              </Link>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="h-64 bg-muted/50 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            ) : wallets.length === 0 ? (
              <Card className="p-12 text-center border-border/50 bg-card/50">
                <WalletIcon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No wallets yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first wallet to start managing your finances
                </p>
                <Link href="/wallet/create">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Wallet
                  </Button>
                </Link>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {wallets.map((wallet) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))}
              </div>
            )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
