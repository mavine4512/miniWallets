import { Router } from 'express';
import { WalletController } from '../controllers/WalletController';
import { authMiddleware } from '../middleware/auth';
import { validateRequest } from '../middleware/validation';
import { CreateWalletSchema, DepositSchema, TransferSchema } from '../schemas/validation';

const router = Router();
const walletController = new WalletController();

// Transfer route must come before :walletId to avoid route conflicts
router.post('/transfer', authMiddleware, validateRequest(TransferSchema), (req, res, next) => {
  walletController.transfer(req, res).catch(next);
});

router.post('/', authMiddleware, validateRequest(CreateWalletSchema), (req, res, next) => {
  walletController.createWallet(req, res).catch(next);
});

router.get('/', authMiddleware, (req, res, next) => {
  walletController.getUserWallets(req, res).catch(next);
});

router.get('/:walletId', authMiddleware, (req, res, next) => {
  walletController.getWalletById(req, res).catch(next);
});

router.put('/:walletId', authMiddleware, (req, res, next) => {
  walletController.updateWallet(req, res).catch(next);
});

router.delete('/:walletId', authMiddleware, (req, res, next) => {
  walletController.deleteWallet(req, res).catch(next);
});

router.post('/:walletId/deposit', authMiddleware, validateRequest(DepositSchema), (req, res, next) => {
  walletController.deposit(req, res).catch(next);
});

export default router;

