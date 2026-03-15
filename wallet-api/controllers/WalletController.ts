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
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
        relations: ['transactions'],
      });

      if (!wallet) throw new AppError(404, 'Wallet not found');

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
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
      });

      if (!wallet) throw new AppError(404, 'Wallet not found');

      if (name)        wallet.name        = name;
      if (description) wallet.description = description;
      if (currency)    wallet.currency    = currency;

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
      const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

      const wallet = await this.walletRepository.findOne({
        where: { id: walletIdString, ownerId: userId },
      });

      if (!wallet) throw new AppError(404, 'Wallet not found');

      await this.walletRepository.remove(wallet);

      res.status(200).json({
        success: true,
        message: 'Wallet deleted successfully',
      });
    } catch (error: any) {
      throw new AppError(400, error.message);
    }
  }

  // async deposit(req: Request, res: Response) {
  //   try {
  //     const { walletId } = req.params;
  //     const userId = (req as any).userId;
  //     const { amount, description } = req.body as DepositInput;
  //     const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

  //     await AppDataSource.transaction(async (manager) => {
  //       const wallet = await manager.findOne(Wallet, {
  //         where: { id: walletIdString, ownerId: userId },
  //         lock: { mode: 'pessimistic_write' },
  //       });

  //       if (!wallet) throw new AppError(404, 'Wallet not found');

  //       wallet.balance = parseFloat(wallet.balance as any) + amount;
  //       await manager.save(wallet);

  //       const transaction = manager.create(Transaction, {
  //         type: TransactionType.DEPOSIT,
  //         amount,
  //         description: description || 'Deposit',
  //         walletId: walletIdString,
  //       });

  //       await manager.save(transaction);

  //       res.status(200).json({
  //         success: true,
  //         message: 'Deposit completed successfully',
  //         data: { wallet, transaction },
  //       });
  //     });
  //   } catch (error: any) {
  //     throw error;
  //   }
  // }
  async deposit(req: Request, res: Response) {
  try {
    const { walletId } = req.params;
    const userId = (req as any).userId;
    const { amount, description } = req.body as DepositInput;
    const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

    await AppDataSource.transaction(async (manager) => {
      // QueryBuilder avoids the LEFT JOIN + FOR UPDATE conflict
      const wallet = await manager
        .createQueryBuilder(Wallet, 'wallet')
        .where('wallet.id = :id AND wallet.ownerId = :ownerId', {
          id: walletIdString,
          ownerId: userId,
        })
        .setLock('pessimistic_write')
        .getOne();

      if (!wallet) throw new AppError(404, 'Wallet not found');

      wallet.balance = parseFloat(wallet.balance as any) + amount;
      await manager.save(wallet);

      const transaction = manager.create(Transaction, {
        type: TransactionType.DEPOSIT,
        amount,
        description: description || 'Deposit',
        walletId: walletIdString,
      });

      await manager.save(transaction);

      res.status(200).json({
        success: true,
        message: 'Deposit completed successfully',
        data: { wallet, transaction },
      });
    });
  } catch (error: any) {
    throw error;
  }
}

 async transfer(req: Request, res: Response) {
  try {
    const userId = (req as any).userId;
    const { fromWalletId, toWalletId, amount, description } = req.body as TransferInput;

    if (fromWalletId === toWalletId) {
      throw new AppError(400, 'Cannot transfer to the same wallet');
    }

    await AppDataSource.transaction(async (manager) => {
      const fromWallet = await manager.findOne(Wallet, {
        where: { id: fromWalletId, ownerId: userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromWallet) throw new AppError(404, 'Source wallet not found');

      const toWallet = await manager.findOne(Wallet, {
        where: { id: toWalletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!toWallet) throw new AppError(404, 'Target wallet not found');

      const fromBalance = parseFloat(fromWallet.balance as any);
      if (fromBalance < amount) throw new AppError(400, 'Insufficient balance');

      fromWallet.balance = fromBalance - amount;
      toWallet.balance   = parseFloat(toWallet.balance as any) + amount;

      await manager.save([fromWallet, toWallet]);

      const outTransaction = manager.create(Transaction, {
        type: TransactionType.TRANSFER_OUT,
        amount,
        description: description || `Transfer to ${toWallet.name}`,
        walletId: fromWalletId,
        relatedWalletId: toWalletId,
      });

      const inTransaction = manager.create(Transaction, {
        type: TransactionType.TRANSFER_IN,
        amount,
        description: description || `Transfer from ${fromWallet.name}`,
        walletId: toWalletId,
        relatedWalletId: fromWalletId,
      });

      await manager.save([outTransaction, inTransaction]);

      res.status(200).json({
        success: true,
        message: 'Transfer completed successfully',
        data: {
          fromWallet,
          toWallet,
          transactions: [outTransaction, inTransaction],
        },
      });
    });
  } catch (error: any) {
    throw error;
  }
}

 async getWalletTransactions(req: Request, res: Response) {
  try {
    const { walletId } = req.params;
    const userId = (req as any).userId;
    const walletIdString = Array.isArray(walletId) ? walletId[0] : walletId;

    const wallet = await this.walletRepository.findOne({
      where: { id: walletIdString, ownerId: userId },
    });

    if (!wallet) throw new AppError(404, 'Wallet not found');

    const transactions = await this.transactionRepository.find({
      where: { walletId: walletIdString },
      order: { createdAt: 'DESC' },
    });

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error: any) {
    throw error;
  }
}

}