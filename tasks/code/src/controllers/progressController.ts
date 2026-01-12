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
    const daysWithTasks = [...new Set(tasks.map((t: any) => new Date(t.createdAt).toDateString()))].length;
    const avgPerDay = daysWithTasks > 0 ? Math.round(completedTasks / daysWithTasks) : 0;

    const completionRate = totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0;

    // 3. Calculate Weekly Bar Chart (STATIC MONDAY - SUNDAY)
    const weeklyData = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // Find the current Monday
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 (Sun) to 6 (Sat)
    // If today is Sunday (0), Monday was 6 days ago. Otherwise, Monday was (day - 1) days ago.
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const monday = new Date(today);
    monday.setDate(today.getDate() - diffToMonday);
    monday.setHours(0, 0, 0, 0); // Reset time to start of day

    // Loop from 0 (Monday) to 6 (Sunday)
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const dayName = days[i];

      const tasksOnDay = tasks.filter((t: any) => {
        // FIX: Use endDate (Planned Date) if it exists, otherwise use createdAt
        const dateToCheck = t.endDate ? new Date(t.endDate) : new Date(t.createdAt);

        return dateToCheck.getDate() === d.getDate() &&
          dateToCheck.getMonth() === d.getMonth() &&
          dateToCheck.getFullYear() === d.getFullYear();
      });

      weeklyData.push({
        day: dayName,
        completed: tasksOnDay.filter((t: any) => t.status === 'Completed').length,
        pending: tasksOnDay.filter((t: any) => t.status !== 'Completed').length
      });
    }

    // 4. Calculate Categories (New List)
    const categoryMap = new Map<string, number>();

    tasks.filter((t: any) => t.status === 'Completed').forEach((t: any) => {
      const cat = t.category || 'Uncategorized';
      categoryMap.set(cat, (categoryMap.get(cat) || 0) + 1);
    });

    // NEW Category Colors
    const categoryColors: Record<string, string> = {
      'Work': '#4F3117',      // Dark Brown
      'Study': '#A89F91',     // Beige/Grey
      'Chores': '#3E2612',    // Very Dark Brown
      'Wellness': '#8C7B65',  // Light Brown
      'Reading': '#5C4B35',   // Medium Brown
      'Hobbies': '#6D5C45',   // Clay
      'Social': '#7A6B5D',    // Taupe
      'Events': '#8F8170'     // Stone
    };

    const categories = Array.from(categoryMap, ([name, value]) => ({
      name,
      value,
      color: categoryColors[name] || '#5C4B35'
    }));

    // 5. Calculate Insights (With Tie Logic)
    let bestDayObj = weeklyData[0];
    if (weeklyData.length > 0) {
      bestDayObj = weeklyData.reduce((prev, curr) =>
        (prev.completed > curr.completed) ? prev : curr, weeklyData[0]
      );
    }

    // --- TIE LOGIC ---
    let topCategoryName = "No quests completed";
    let topCategoryValue = 0;

    if (categories.length > 0) {
      categories.sort((a, b) => b.value - a.value);
      const winner = categories[0];
      topCategoryValue = winner.value;

      const ties = categories.filter(c => c.value === winner.value);

      if (ties.length > 1) {
        const names = ties.map(c => c.name);
        topCategoryName = names.join(' & ');
      } else {
        topCategoryName = winner.name;
      }
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

    const finalBestDay = bestDayObj.completed > 0 ? bestDayObj.day : "No activity yet";
    const finalBestDayCount = bestDayObj.completed;

    const insights = {
      bestDay: finalBestDay,
      bestDayCount: finalBestDayCount,
      topCategory: topCategoryName, // Uses the new tie logic string
      topCategoryCount: topCategoryValue,
      streak: streak
    };

    // 6. Return response
    res.status(200).json({
      success: true,
      stats: {
        totalCompleted: completedTasks,
        completionRate,
        avgPerDay,
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
