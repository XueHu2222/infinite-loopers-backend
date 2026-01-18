import { PrismaClient, Achievement } from '@prisma/client';

const prisma = new PrismaClient();

// Achievement definition interface
interface AchievementDefinition {
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
}

// Define all available achievements
export const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    key: 'first_task',
    name: 'First Step',
    description: 'Complete your first quest',
    icon: '🎯',
    points: 5
  },
  {
    key: 'task_warrior_5',
    name: 'Task Warrior',
    description: 'Complete 5 quests',
    icon: '⚔️',
    points: 25
  },
  {
    key: 'task_master_10',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: '👑',
    points: 50
  },
  {
    key: 'task_legend_25',
    name: 'Task Legend',
    description: 'Complete 25 quests',
    icon: '🏆',
    points: 100
  },
  {
    key: 'task_century_100',
    name: 'Perfectionist',
    description: 'Complete 100 quests',
    icon: '💯',
    points: 300
  },
  {
    key: 'speedster',
    name: 'Speed Runner',
    description: 'Complete a quest under 5 minutes',
    icon: '⚡',
    points: 80
  },
  {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a quest before its due date',
    icon: '🐦',
    points: 20
  },
  {
    key: 'productive_day',
    name: 'Productive Day',
    description: 'Complete 3 quests in one day',
    icon: '📈',
    points: 50
  }
];

// Initialize achievements in database
export async function initializeAchievements(): Promise<void> {
  console.log('Initializing achievements...');
  for (const achievement of ACHIEVEMENTS) {
    await prisma.achievement.upsert({
      where: { key: achievement.key },
      update: {},
      create: achievement
    });
  }
  console.log('Achievements initialized successfully!');
}

// User achievement with unlock status interface
interface UserAchievementWithStatus {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockedAt: Date | null;
}

// Get all achievements for a user with unlock status
export async function getUserAchievements(userId: number): Promise<UserAchievementWithStatus[]> {
  const unlocked = await prisma.userAchievement.findMany({
    where: { userId },
    include: {
      achievement: true
    }
  });

  const allAchievements = await prisma.achievement.findMany();

  return allAchievements.map(achievement => {
    const userAchievement = unlocked.find(ua => ua.achievementId === achievement.id);
    
    return {
      id: achievement.id,
      key: achievement.key,
      name: achievement.name,
      description: achievement.description,
      icon: achievement.icon,
      points: achievement.points,
      unlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlockedAt || null
    };
  });
}

// User stats interface
interface UserStatsResponse {
  totalXP: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  completionRate: number;
}

// Get user stats
export async function getUserStats(userId: number): Promise<UserStatsResponse> {
  let stats = await prisma.userStats.findUnique({
    where: { userId }
  });

  if (!stats) {
    stats = await prisma.userStats.create({
      data: { userId }
    });
  }

  const totalAchievements = await prisma.achievement.count();
  const unlockedCount = await prisma.userAchievement.count({
    where: { userId }
  });

  return {
    totalXP: stats.totalXP,
    achievementsUnlocked: unlockedCount,
    totalAchievements: totalAchievements,
    completionRate: totalAchievements > 0 ? Math.round((unlockedCount / totalAchievements) * 100) : 0
  };
}

// Unlock a specific achievement for a user
export async function unlockAchievement(
  userId: number, 
  achievementKey: string
): Promise<Achievement | null> {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { key: achievementKey }
    });

    if (!achievement) {
      console.error(`Achievement not found: ${achievementKey}`);
      return null;
    }

    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId,
          achievementId: achievement.id
        }
      }
    });

    if (existing) {
      return null; // Already unlocked
    }

    await prisma.userAchievement.create({
      data: {
        userId,
        achievementId: achievement.id
      }
    });

    await fetch(`http://localhost:3011/users/${userId}/add-rewards`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ xp: achievement.points})
    });

    await prisma.userStats.upsert({
      where: { userId },
      update: {
        totalXP: { increment: achievement.points },
        achievementsCount: { increment: 1 },
        lastUpdated: new Date()
      },
      create: {
        userId,
        totalXP: achievement.points,
        achievementsCount: 1
      }
    });

    return achievement;
  } catch (error) {
    console.error('Error unlocking achievement:', error);
    return null;
  }
}

// Task data interface
interface TaskCompletionData {
  completedCount: number;
  completedToday: number;
  createdAt: Date;
  completedAt: Date;
  endDate?: Date;
}

// Check task achievements
export async function checkTaskAchievements(
  userId: number, 
  taskData: TaskCompletionData
): Promise<Achievement[]> {
  const newlyUnlocked: Achievement[] = [];

  // First task
  if (taskData.completedCount === 1) {
    const unlocked = await unlockAchievement(userId, 'first_task');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  // Task milestones
  if (taskData.completedCount === 5) {
    const unlocked = await unlockAchievement(userId, 'task_warrior_5');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if (taskData.completedCount === 10) {
    const unlocked = await unlockAchievement(userId, 'task_master_10');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if (taskData.completedCount === 25) {
    const unlocked = await unlockAchievement(userId, 'task_legend_25');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  if (taskData.completedCount === 100) {
    const unlocked = await unlockAchievement(userId, 'task_century_100');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  // Speedster (completed in under 5 minutes)
  const timeDiff = taskData.completedAt.getTime() - taskData.createdAt.getTime();
  const minutesDiff = timeDiff / (1000 * 60);
  
  if (minutesDiff < 5) {
    const unlocked = await unlockAchievement(userId, 'speedster');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  // Early bird (completed before due date)
  if (taskData.endDate && taskData.completedAt < taskData.endDate) {
    const unlocked = await unlockAchievement(userId, 'early_bird');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  // Productive day (3 tasks in one day)
  if (taskData.completedToday >= 3) {
    const unlocked = await unlockAchievement(userId, 'productive_day');
    if (unlocked) newlyUnlocked.push(unlocked);
  }

  return newlyUnlocked;
}