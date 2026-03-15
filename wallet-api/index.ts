import 'dotenv/config';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { AppDataSource } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import walletRoutes from './routes/walletRoutes';

const app: Application = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check (before database connection)
app.get('/api/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'API is running', database: AppDataSource.isInitialized ? 'connected' : 'connecting' });
});

// Database connection
AppDataSource.initialize()
  .then(async () => {
    console.log('✓ Database connected successfully');
    
    // Synchronize schema (create tables if they don't exist)
    try {
      console.log('Synchronizing database schema...');
      await AppDataSource.synchronize();
      console.log('✓ Database schema synchronized');
    } catch (syncError) {
      console.warn('⚠ Schema sync warning:', syncError);
    }
    
    // Routes - only register after DB is ready
    app.use('/api/auth', authRoutes);
    app.use('/api/wallets', walletRoutes);

    // Error handling middleware
    app.use(errorHandler);

    // Start server
    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
    });
  })
  .catch((error) => {
    console.error('✗ Database connection error:', error);
    console.error('Connection string:', process.env.DATABASE_URL?.replace(/:[^@]*@/, ':***@'));
    process.exit(1);
  });
