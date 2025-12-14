import { Router } from 'express';
import * as achievementController from '../controllers/achievementController.js';

const router = Router();

// Get all achievements for a user
router.get('/user/:userId', achievementController.getUserAchievements);

// Get user stats
router.get('/user/:userId/stats', achievementController.getUserStats);

// Webhook for task completion (called by tasks service)
router.post('/webhook/task-completed', achievementController.handleTaskCompletion);

// Initialize achievements (run once on setup)
router.post('/initialize', achievementController.initializeAchievements);

export default router;