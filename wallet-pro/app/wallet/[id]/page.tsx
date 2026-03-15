'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuthContext } from '@/components/context/AuthContext';
import { useWallets } from '@/hooks/useWallets';
import { useTransactions } from '@/hooks/useTransactions';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Header } from '@/components/Header';
import { TransactionList } from '@/components/TransactionList';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Plus, Send, Download } from 'lucide-react';
import Link from 'next/link';

export default function WalletDetailsPage() {
  const params = useParams();
  const walletId = params.id as string;
  const { token } = useAuthContext();
  const { wallets, fetchWallets } = useWallets();
  const { transactions, fetchTransactions, isLoading: transLoading } = useTransactions();

  const wallet = wallets.find(w => w.id === walletId);

  useEffect(() => {
    if (token) {
      fetchWallets(token);
    }
  }, [token, fetchWallets]);

  useEffect(() => {
    if (token && walletId) {
      fetchTransactions(token, walletId);
    }
  }, [token, walletId, fetchTransactions]);

  if (!wallet) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Card className="p-12 text-center border-border/50">
              <h3 className="text-lg font-semibold text-foreground">Wallet not found</h3>
              <Link href="/dashboard">
                <Button className="mt-4 bg-primary hover:bg-primary/90 text-primary-foreground">
                  Back to Dashboard
                </Button>
              </Link>
            </Card>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: wallet.currency,
  }).format(Number(wallet.balance));

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/dashboard">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{wallet.name}</h1>
              <p className="text-muted-foreground">{wallet.currency} Wallet</p>
            </div>
          </div>

          {/* Balance Card */}
          <Card className="p-8 bg-gradient-to-br from-primary/10 to-primary/5 border-border/50 mb-8">
            <p className="text-sm text-muted-foreground mb-2">Current Balance</p>
            <p className="text-4xl font-bold text-foreground mb-6">{formattedBalance}</p>
            
            {wallet.description && (
              <p className="text-muted-foreground mb-6">{wallet.description}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <Link href={`/wallet/${wallet.id}/deposit`}>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  <Download className="w-4 h-4 mr-2" />
                  Deposit
                </Button>
              </Link>
              <Link href={`/wallet/${wallet.id}/transfer`}>
                <Button variant="outline">
                  <Send className="w-4 h-4 mr-2" />
                  Transfer
                </Button>
              </Link>
            </div>
          </Card>

          {/* Transactions */}
          <div>
            <h2 className="text-xl font-bold text-foreground mb-6">Recent Transactions</h2>
            <Card className="p-6 border-border/50">
              <TransactionList transactions={transactions} isLoading={transLoading} />
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
