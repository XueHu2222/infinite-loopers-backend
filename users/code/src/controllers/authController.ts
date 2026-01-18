import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import type { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    // Check if user exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] }
    });

    if (existingUser) {
      res.status(400).json({ success: false, message: 'Username aready taken try with another one' });
      return;
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword, ownedCharacters: {create: [{ characterId: 1 }]}}
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Email and password are required' });
      return;
    }

    // Find user
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    res.cookie('userId', user.id, {
      httpOnly: false,
      secure: false,
      path: '/',
      sameSite: 'lax'
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: { id: user.id, username: user.username, email: user.email }
    });
  } catch (err) {
    next(err);
  }
}

export async function logout (req: Request, res: Response) {
    res.clearCookie('userId', { path: '/' });
    res.status(200).json({ success: true, message: 'Logged out' });
};
