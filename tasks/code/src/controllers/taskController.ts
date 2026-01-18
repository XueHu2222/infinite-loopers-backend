/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export async function getTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = parseInt(String(req.params.userId));

    const tasks = await prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
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
        status: 'Not Started',
        priority: priority || 'Medium',
        category: category || null,
      },
    });

    res.status(201).json({ success: true, message: 'Task added successfully', task: createdTask });
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing task's details (notes, suggestions, subtasks, status, etc.).
 * This powers the quest log detail modal, including subtask persistence.
 */
export async function updateTask(req: Request, res: Response) {
  try {
    const taskId = parseInt(String(req.params.taskId));

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const {
      title,
      endDate,
      category,
      priority,
      status,
      notes,
      suggestions,
      subtasks,
      duration,
      timeSpent,
    } = req.body;

    const data: any = {};

    if (title !== undefined) data.title = title;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (category !== undefined) data.category = category;
    if (priority !== undefined) data.priority = priority;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;
    if (suggestions !== undefined) data.suggestions = suggestions;
    if (subtasks !== undefined) data.subtasks = subtasks;
    if (duration !== undefined) data.duration = duration;
    if (timeSpent !== undefined) data.timeSpent = timeSpent;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data,
    });

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to update task',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

// Complete a task and check for achievements
export async function completeTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = parseInt(String(req.params.taskId));

    // Get the task
    const task = await prisma.task.findUnique({
      where: { id: taskId },
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
        completedAt: new Date(),
      },
    });

    // Count completed tasks
    const completedCount = await prisma.task.count({
      where: {
        userId: task.userId,
        status: 'Completed',
      },
    });

    // Count tasks completed today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedToday = await prisma.task.count({
      where: {
        userId: task.userId,
        status: 'Completed',
        completedAt: {
          gte: today,
        },
      },
    });

    // Call achievements service
    let unlockedAchievements = [];
    try {
      const ACHIEVEMENTS_SERVICE_URL = process.env.ACHIEVEMENTS_SERVICE_URL || 'http://localhost:3020';
      const achievementsRes = await fetch(`${ACHIEVEMENTS_SERVICE_URL}/achievements/webhook/task-completed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: task.userId,
          completedCount,
          completedToday,
          createdAt: task.createdAt,
          completedAt: updatedTask.completedAt,
          endDate: task.endDate,
        }),
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
      unlockedAchievements,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteTask(req: Request, res: Response, next: NextFunction) {
  try {
    const taskId = parseInt(String(req.params.taskId));

    // Check if task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found',
      });
    }
    await prisma.task.delete({
      where: { id: taskId },
    });

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}
