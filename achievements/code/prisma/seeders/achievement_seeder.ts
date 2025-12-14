import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const achievements = [
  {
    key: 'first_task',
    name: 'First Step',
    description: 'Complete your first quest',
    icon: '🎯',
    points: 5,
  },
  {
    key: 'task_warrior_5',
    name: 'Task Warrior',
    description: 'Complete 5 quests',
    icon: '⚔️',
    points: 25,
  },
  {
    key: 'task_master_10',
    name: 'Quest Master',
    description: 'Complete 10 quests',
    icon: '👑',
    points: 50,
  },
  {
    key: 'task_legend_25',
    name: 'Task Legend',
    description: 'Complete 25 quests',
    icon: '🏆',
    points: 100,
  },
  {
    key: 'task_century_100',
    name: 'Perfectionist',
    description: 'Complete 100 quests',
    icon: '💯',
    points: 300,
  },
  {
    key: 'speedster',
    name: 'Speed Runner',
    description: 'Complete a quest under 5 minutes',
    icon: '⚡',
    points: 80,
  },
  {
    key: 'early_bird',
    name: 'Early Bird',
    description: 'Complete a quest before its due date',
    icon: '🐦',
    points: 20,
  },
  {
    key: 'productive_day',
    name: 'Productive Day',
    description: 'Complete 3 quests in one day',
    icon: '📝',
    points: 50,
  },
];

export const loadAchievements = async (): Promise<void> => {
  try {
    for (const achievement of achievements) {
      await prisma.achievement.upsert({
        where: { key: achievement.key },
        update: {},
        create: achievement,
      });
    }
  } catch (error) {
    console.error('Error seeding achievements:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
