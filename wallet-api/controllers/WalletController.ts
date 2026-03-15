import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Wallet } from '../entities/Wallet';
import { Transaction, TransactionType } from '../entities/Transaction';
import { AppError } from '../middleware/errorHandler';
import { CreateWalletInput, DepositInput, TransferInput } from '../schemas/validation';

export class WalletController {
   private get walletRepository() {
    return AppDataSource.getRepository(Wallet);
  }
  private get transactionRepository() {
    return AppDataSource.getRepository(Transaction);
  }

  async createWallet(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { name, description, currency, balance } = req.body as CreateWalletInput;

      // Create new wallet
      const wallet = this.walletRepository.create({
        name,
        description,
        currency: currency || 'KES',
        balance: balance || 0,
        ownerId: userId,
      });

      await this.walletRepository.save(wallet);

      res.status(201).json({
        success: true,
        message: 'Wallet created successfully',
        data: wallet,
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  }

  async getUserWallets(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Get all wallets for user
      const wallets = await this.walletRepository.find({
        where: { ownerId: userId },
        relations: ['transactions'],
      });

      res.status(200).json({
        success: true,
        data: wallets,
      });
    } catch (error: any) {
      throw new AppError(500, error.message);
    }
  }

  async getWalletById(req: Request, res: Response) {
    try {
      const { walletId } = req.params;
      const userId = (req as any).userId;

      // FIX: Ensure walletId is treated as a single string
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      // Get wallet by ID and verify ownership
      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
        relations: ['transactions'],
      });

      if (!wallet) {
        throw new AppError(404, 'Wallet not found');
      }

      res.status(200).json({
        success: true,
        data: wallet,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async updateWallet(req: Request, res: Response) {
    try {
      const { walletId } = req.params;
      const userId = (req as any).userId;
      const { name, description, currency } = req.body;

      // FIX: Ensure walletId is treated as a single string
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      // Get wallet by ID and verify ownership
      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
      });

      if (!wallet) {
        throw new AppError(404, 'Wallet not found');
      }

      // Update wallet fields
      if (name) wallet.name = name;
      if (description) wallet.description = description;
      if (currency) wallet.currency = currency;

      await this.walletRepository.save(wallet);

      res.status(200).json({
        success: true,
        message: 'Wallet updated successfully',
        data: wallet,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async deleteWallet(req: Request, res: Response) {
    try {
      const { walletId } = req.params;
      const userId = (req as any).userId;

      // FIX: Ensure walletId is treated as a single string
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      // Get wallet by ID and verify ownership
      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
      });

      if (!wallet) {
        throw new AppError(404, 'Wallet not found');
      }

      // Delete wallet
      await this.walletRepository.remove(wallet);

      res.status(200).json({
        success: true,
        message: 'Wallet deleted successfully',
        data: { success: true },
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  }

  async deposit(req: Request, res: Response) {
    try {
      const { walletId } = req.params;
      const userId = (req as any).userId;
      const { amount, description } = req.body as DepositInput;

      // FIX: Ensure walletId is treated as a single string
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      // Get wallet and verify ownership
      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
      });

      if (!wallet) {
        throw new AppError(404, 'Wallet not found');
      }

      // Update wallet balance
      wallet.balance = Number(wallet.balance) + amount;
      await this.walletRepository.save(wallet);

      // Create deposit transaction
      const transaction = this.transactionRepository.create({
        type: TransactionType.DEPOSIT,
        amount,
        description: description || 'Deposit',
        walletId: walletIdString,
      });

      await this.transactionRepository.save(transaction);

      res.status(200).json({
        success: true,
        message: 'Deposit completed successfully',
        data: { wallet, transaction },
      });
    } catch (error: any) {
      throw error;
    }
  }

  async transfer(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;
      const { fromWalletId, toWalletId, amount, description } = req.body as TransferInput;

      // Get source wallet and verify ownership
      const fromWallet = await this.walletRepository.findOne({
        where: { id: fromWalletId, ownerId: userId },
      });

      if (!fromWallet) {
        throw new AppError(404, 'Source wallet not found');
      }

      // Get target wallet (no ownership check needed)
      const toWallet = await this.walletRepository.findOne({
        where: { id: toWalletId },
      });

      if (!toWallet) {
        throw new AppError(404, 'Target wallet not found');
      }

      // Check sufficient balance
      if (Number(fromWallet.balance) < amount) {
        throw new AppError(400, 'Insufficient balance');
      }

      // Update balances
      fromWallet.balance = Number(fromWallet.balance) - amount;
      toWallet.balance = Number(toWallet.balance) + amount;

      await this.walletRepository.save([fromWallet, toWallet]);

      // Create transfer out transaction
      const outTransaction = this.transactionRepository.create({
        type: TransactionType.TRANSFER_OUT,
        amount,
        description: description || `Transfer to ${toWallet.name}`,
        walletId: fromWalletId,
        relatedWalletId: toWalletId,
      });

      // Create transfer in transaction
      const inTransaction = this.transactionRepository.create({
        type: TransactionType.TRANSFER_IN,
        amount,
        description: description || `Transfer from ${fromWallet.name}`,
        walletId: toWalletId,
        relatedWalletId: fromWalletId,
      });

      await this.transactionRepository.save([outTransaction, inTransaction]);

      res.status(200).json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          fromWallet,
          toWallet,
          transactions: [outTransaction, inTransaction],
        },
      });
    } catch (error: any) {
      throw error;
    }
  }
}