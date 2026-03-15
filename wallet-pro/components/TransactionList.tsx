'use client';

import { Transaction, TransactionType } from '@/lib/types';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

export function TransactionList({ transactions, isLoading }: TransactionListProps) {
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return <ArrowDownLeft className="w-5 h-5 text-green-600" />;
      case TransactionType.TRANSFER_OUT:
        return <ArrowUpRight className="w-5 h-5 text-blue-600" />;
      case TransactionType.TRANSFER_IN:
        return <ArrowDownLeft className="w-5 h-5 text-blue-600" />;
      default:
        return <ArrowRightLeft className="w-5 h-5 text-gray-600" />;
    }
  };

  const getAmountColor = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'text-green-600';
      case TransactionType.TRANSFER_OUT:
        return 'text-red-600';
      case TransactionType.TRANSFER_IN:
        return 'text-green-600';
      default:
        return 'text-foreground';
    }
  };

  const getAmountSign = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return '+';
      case TransactionType.TRANSFER_OUT:
        return '-';
      case TransactionType.TRANSFER_IN:
        return '+';
      default:
        return '';
    }
  };

  const getTransactionLabel = (type: TransactionType) => {
    switch (type) {
      case TransactionType.DEPOSIT:
        return 'Deposit';
      case TransactionType.TRANSFER_OUT:
        return 'Transfer Out';
      case TransactionType.TRANSFER_IN:
        return 'Transfer In';
      default:
        return type;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((transaction) => (
        <div
          key={transaction.id}
          className="flex items-center justify-between p-4 bg-card/50 border border-border/50 rounded-lg hover:border-border transition-colors"
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center">
              {getTransactionIcon(transaction.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground">
                {getTransactionLabel(transaction.type)}
              </p>
              <p className="text-xs text-muted-foreground">{transaction.description || '-'}</p>
            </div>
          </div>

          <div className="text-right">
            <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
              {getAmountSign(transaction.type)}${transaction.amount.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(transaction.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
