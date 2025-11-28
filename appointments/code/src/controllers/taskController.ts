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
