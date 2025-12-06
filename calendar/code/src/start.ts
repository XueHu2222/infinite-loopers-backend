import Express, { Application, Request, Response, NextFunction } from 'express';
import * as Dotenv from 'dotenv';
Dotenv.config({ path: '.env' });

import IndexRouter from './routes/index.ts';
import { errorHandler } from './middleware/errors/errorHandler.ts';
import helmet from 'helmet';
import cors from 'cors';

const app: Application = Express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3010;

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Body parsers
app.use(Express.json());
app.use(Express.urlencoded({ extended: true }));

// Main routes
app.use('/tasks', IndexRouter);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new Error('Resource not found', { cause: 404 }));
});

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`🍿 Task service running → PORT ${port}`);
});

// Optional: handle unhandled promise rejections and uncaught exceptions
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});
