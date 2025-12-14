import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const userAchievements = [
  {
    userId: 1,
    achievementId: 1,
    unlockedAt: new Date(1765721140000),
    progress: null as string | null,
  },
  {
    userId: 1,
    achievementId: 6,
    unlockedAt: new Date(1765721150000),
    progress: null as string | null,
  },
];

const userStats = [
  {
    userId: 1,
    totalXP: 85,
    achievementsCount: 2,
    lastUpdated: new Date(1765721150000),
  },
];

export const loadUserAchievements = async (): Promise<void> => {
  try {
    for (const ua of userAchievements) {
      await prisma.userAchievement.upsert({
        where: {
          userId_achievementId: {
            userId: ua.userId,
            achievementId: ua.achievementId,
          },
        },
        update: {},
        create: ua,
      });
    }
  } catch (error) {
    console.error('Error seeding UserAchievements:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

export const loadUserStats = async (): Promise<void> => {
  try {
    for (const us of userStats) {
      await prisma.userStats.upsert({
        where: { userId: us.userId },
        update: {},
        create: us,
      });
    }
  } catch (error) {
    console.error('Error seeding UserStats:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
