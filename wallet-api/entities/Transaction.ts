import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Wallet } from './Wallet';

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  TRANSFER_OUT = 'TRANSFER_OUT',
  TRANSFER_IN = 'TRANSFER_IN',
}

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'enum',
    enum: TransactionType,
  })
  type: TransactionType;

  @Column({ 
    type: 'decimal', 
    precision: 15, 
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value)
    }
  })
  amount!: number;

  @Column({ type: 'varchar', nullable: true })
  description?: string;

  @Column({ type: 'uuid' })
  walletId!: string;

  @ManyToOne(() => Wallet, (wallet) => wallet.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'walletId' })
  wallet!: Wallet;

  @Column({ type: 'uuid', nullable: true })
  relatedWalletId?: string;

  @ManyToOne(() => Wallet, { nullable: true })
  @JoinColumn({ name: 'relatedWalletId' })
  relatedWallet?: Wallet;

  @CreateDateColumn()
  createdAt!: Date;
}