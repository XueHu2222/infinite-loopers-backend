import { Request, Response, NextFunction } from 'express';
import * as achievementService from '../services/achievementService.js';

// Get all achievements for a user with unlock status
export async function getUserAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const achievements = await achievementService.getUserAchievements(userId);

    res.status(200).json({ 
      success: true, 
      achievements 
    });
  } catch (err) {
    next(err);
  }
}

// Get user stats (XP, completion rate)
export async function getUserStats(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }

    const stats = await achievementService.getUserStats(userId);

    res.status(200).json({ 
      success: true, 
      stats 
    });
  } catch (err) {
    next(err);
  }
}

// Webhook endpoint for task completion (called from tasks service)
export async function handleTaskCompletion(req: Request, res: Response, next: NextFunction) {
  try {
    const { 
      userId, 
      completedCount, 
      completedToday,
      createdAt, 
      completedAt, 
      endDate 
    } = req.body;

    if (!userId || completedCount === undefined) {
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    const taskData = {
      completedCount,
      completedToday,
      createdAt: new Date(createdAt),
      completedAt: new Date(completedAt),
      endDate: endDate ? new Date(endDate) : undefined
    };

    const unlockedAchievements = await achievementService.checkTaskAchievements(userId, taskData);

    res.status(200).json({ 
      success: true, 
      unlockedAchievements 
    });
  } catch (err) {
    next(err);
  }
}

// Initialize achievements in database (run once)
export async function initializeAchievements(req: Request, res: Response, next: NextFunction) {
  try {
    await achievementService.initializeAchievements();
    
    res.status(200).json({ 
      success: true, 
      message: 'Achievements initialized successfully' 
    });
  } catch (err) {
    next(err);
  }
}