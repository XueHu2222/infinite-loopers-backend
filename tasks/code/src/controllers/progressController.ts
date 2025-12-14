import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);

    if (isNaN(userId)) {
        res.status(400).json({ success: false, message: 'Invalid user ID' });
        return;
    }

    // 1. Fetch all tasks for this user
    const tasks = await prisma.task.findMany({
      where: { userId }
    });

    // 2. Calculate Basic Stats
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t: any) => t.status === 'Completed').length;

    // Avoid division by zero
    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    const avgPerDay = Math.round(completedTasks / 7);

    // 3. Calculate Weekly Bar Chart (Last 7 Days)
    const weeklyData = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(today.getDate() - i);
      const dayName = days[d.getDay()];

    // Filter tasks created on this specific day
      // TODO: In the future, we should add a 'completedAt' field to the Database.
      // Currently, this chart shows when tasks were CREATED, not necessarily when finished.
      const tasksOnDay = tasks.filter((t: any) => {
        const tDate = new Date(t.createdAt);
        return tDate.getDate() === d.getDate() &&
               tDate.getMonth() === d.getMonth();
      });

      weeklyData.push({
        day: dayName,
        completed: tasksOnDay.filter((t: any) => t.status === 'Completed').length,
        pending: tasksOnDay.filter((t: any) => t.status !== 'Completed').length
      });
    }

    // 4. Calculate Categories
    const categoryMap = new Map<string, number>();

    tasks.filter((t: any) => t.status === 'Completed').forEach((t: any) => {
      const cat = t.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    const categoryColors: Record<string, string> = {
      'Chores': '#3E2612',
      'Work': '#4F3117',
      'Reading': '#5C4B35',
      'Health': '#8C7B65',
      'School': '#A89F91'
    };

    const categories = Array.from(categoryMap, ([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#5C4B35'
    }));

   // 5. Calculate Insights
    let bestDayObj = weeklyData[0];
    if (weeklyData.length > 0) {
        bestDayObj = weeklyData.reduce((prev, curr) =>
            (prev.completed > curr.completed) ? prev : curr, weeklyData[0]
        );
    }

    let topCategoryObj = { name: 'No quests completed', value: 0 };
    if (categories.length > 0) {
        topCategoryObj = categories.reduce((prev, curr) =>
            (prev.value > curr.value) ? prev : curr
        );
    }

    // --- INFINITE STREAK LOGIC ---
    const allCompletedTasks = await prisma.task.findMany({
        where: {
            userId: userId,
            status: 'Completed'
        },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true }
    });

    const completedDates = new Set(
        allCompletedTasks.map((t: any) => new Date(t.createdAt).toISOString().split('T')[0])
    );

    let streak = 0;
    const checkDate = new Date();

    while (true) {
        const dateString = checkDate.toISOString().split('T')[0];

        if (completedDates.has(dateString)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            const todayStr = new Date().toISOString().split('T')[0];
            if (dateString === todayStr) {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            }
            break;
        }
    }

    // Insight Strings
    const finalBestDay = bestDayObj.completed > 0 ? bestDayObj.day : "No activity yet";
    const finalBestDayCount = bestDayObj.completed;

    const insights = {
      bestDay: finalBestDay,
      bestDayCount: finalBestDayCount,
      topCategory: topCategoryObj.name,
      topCategoryCount: topCategoryObj.value,
      streak: streak
    };

    // 6. Return response
    res.status(200).json({
        success: true,
        stats: {
            totalCompleted: completedTasks,
            completionRate,
            avgPerDay,
            // TODO: Fetch real coins/level from Users Service when Achievements are ready
            coins: 0,
            level: 1,
            currentXp: 0,
            maxXp: 100,
            weeklyData,
            categories,
            insights
        }
    });

  } catch (err) {
    next(err);
  }
}
