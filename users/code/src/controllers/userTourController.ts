/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma = new PrismaClient();

export async function getTourStatus(
    req: Request,
    res: Response
): Promise<void> {
    try {
        const userId = req.cookies.userId;

        if (!userId) {
            res.status(401).json({ error: 'Not logged in' });
            return;
        }

        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: { hasFinishedTour: true }
        });

        res.json(user);

        // return res.json({ hasFinishedTour: false });

    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tour status' });
    }
}

export async function finishTour(
    req: Request,
    res: Response
): Promise<Response> {
    try {
        const userId = req.cookies.userId;

        if (!userId) {
            return res.status(401).json({ error: 'Not logged in' });
        }

        await prisma.user.update({
            where: { id: Number(userId) },
            data: { hasFinishedTour: true }
        });

        return res.json({ success: true });
    } catch (err) {
        return res.status(500).json({
            error: 'Failed to update tour status'
        });
    }
}
