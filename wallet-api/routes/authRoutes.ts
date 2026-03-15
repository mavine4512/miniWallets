import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { validateRequest } from '../middleware/validation';
import { RegisterSchema, LoginSchema } from '../schemas/validation';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

router.post('/register', validateRequest(RegisterSchema), (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/login', validateRequest(LoginSchema), (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get('/profile', authMiddleware, (req, res, next) => {
  authController.getProfile(req, res).catch(next);
});

export default router;
