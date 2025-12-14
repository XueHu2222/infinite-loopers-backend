import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(req.params.userId);

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, tasks });
  } catch (err) {
    next(err);
  }
}



export async function addTask(req: Request, res: Response, next: NextFunction) {
	try {
		const { userId, title, endDate, category, priority } = req.body;

		if (!title) {
			return res.status(400).json({ success: false, message: 'Task title is required' });
		}

		const createdTask = await prisma.task.create({
			data: {
				userId,
				title,
				endDate: endDate ? new Date(endDate) : null,
				status: "Not Started",
				priority: priority || "Medium",
				category: category || null
			}
		});

		res.status(201).json({ success: true, message: 'Task added successfully', task: createdTask });
	} catch (err) {
		next(err);
	}
}
// Complete a task and check for achievements
export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = parseInt(req.params.taskId);

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId }
    });

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    if (task.status === 'Completed') {
      return res.status(400).json({ success: false, message: 'Task already completed' });
    }

    // Mark task as completed
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'Completed',
        completedAt: new Date()
      }
    });

    // Count completed tasks
    const completedCount = await prisma.task.count({
      where: {
        userId: task.userId,
        status: 'Completed'
      }
    });

    // Count tasks completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await prisma.task.count({
      where: {
        userId: task.userId,
        status: 'Completed',
        completedAt: {
          gte: today
        }
      }
    });

    // Call achievements service
    let unlockedAchievements = [];
    try {
      const achievementsRes = await fetch('http://localhost:3020/achievements/webhook/task-completed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: task.userId,
          completedCount,
          completedToday,
          createdAt: task.createdAt,
          completedAt: updatedTask.completedAt,
          endDate: task.endDate
        })
      });

      const achievementsData = await achievementsRes.json();
      if (achievementsData.success) {
        unlockedAchievements = achievementsData.unlockedAchievements;
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
      // Continue even if achievements service fails
    }

    res.status(200).json({
      success: true,
      message: 'Task completed successfully',
      task: updatedTask,
      unlockedAchievements
    });
  } catch (err) {
    next(err);
  }
}
