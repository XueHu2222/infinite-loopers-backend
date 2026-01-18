/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response) {
  console.error('Error:', err);
  res.status(err.cause || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
}