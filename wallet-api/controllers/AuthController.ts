import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { RegisterInput, LoginInput } from '../schemas/validation';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);

  async register(req: Request, res: Response) {
    try {
      const { email, name, password } = req.body as RegisterInput;

      // Check if user already exists
      const existingUser = await this.userRepository.findOne({ where: { email } });
      if (existingUser) {
        throw new AppError(400, 'User already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = this.userRepository.create({
        email,
        name,
        password: hashedPassword,
      });

      await this.userRepository.save(user);

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: tokens,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body as LoginInput;

      // Find user by email
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        throw new AppError(401, 'Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError(401, 'Invalid email or password');
      }

      // Generate tokens
      const tokens = this.generateTokens(user.id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: tokens,
      });
    } catch (error: any) {
      throw error;
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Get user with relations
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['wallets'],
      });

      if (!user) {
        throw new AppError(404, 'User not found');
      }

      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.status(200).json({
        success: true,
        data: userWithoutPassword,
      });
    } catch (error: any) {
      throw error;
    }
  }

  private generateTokens(userId: string) {
    // FIX: Properly type the JWT secret
    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const refreshSecret = process.env.JWT_SECRET || 'secret'; // You might want a separate refresh secret
    
    // FIX: Use proper expiresIn format (string or number)
    const accessTokenExpiry = process.env.JWT_EXPIRY || '7d';
    const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || '30d';

    // Generate access token
    const accessToken = jwt.sign(
      { userId },
      jwtSecret,
      { expiresIn: accessTokenExpiry as jwt.SignOptions['expiresIn'] }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      { userId },
      refreshSecret,
      { expiresIn: refreshTokenExpiry as jwt.SignOptions['expiresIn'] }
    );

    return { accessToken, refreshToken, userId };
  }
}