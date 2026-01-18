interface Achievement {
  id: number;
  key: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  createdAt: Date;
}

interface UserAchievement {
  id: number;
  userId: number;
  achievementId: number;
  unlockedAt: Date;
  progress?: string;
  achievement: Achievement;
}

interface UserStats {
  id: number;
  userId: number;
  totalXP: number;
  achievementsCount: number;
  lastUpdated: Date;
}
 
export { Achievement, UserAchievement, UserStats};