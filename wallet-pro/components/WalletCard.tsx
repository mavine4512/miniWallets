'use client';

import { Wallet } from '@/lib/types';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, DollarSign } from 'lucide-react';

interface WalletCardProps {
  wallet: Wallet;
}

export function WalletCard({ wallet }: WalletCardProps) {
  const formattedBalance = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: wallet.currency,
  }).format(Number(wallet.balance));

  return (
    <Card className="p-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent hover:border-primary/50 transition-all hover:shadow-lg group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <DollarSign className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{wallet.name}</h3>
            <p className="text-xs text-muted-foreground">{wallet.currency}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{formattedBalance}</p>
        </div>

        {wallet.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{wallet.description}</p>
        )}

        <div className="flex gap-2 pt-2">
          <Link href={`/wallet/${wallet.id}`} className="flex-1">
            <Button variant="outline" className="w-full h-9 text-sm border-primary/20 hover:border-primary/50">
              View Details
            </Button>
          </Link>
          <Link href={`/wallet/${wallet.id}/deposit`} className="flex-1">
            <Button className="w-full h-9 text-sm bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground">
              Deposit
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}