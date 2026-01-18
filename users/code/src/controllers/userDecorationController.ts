/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
const prisma: PrismaClient = new PrismaClient();

interface DecorationsResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: number[]
}

export async function getAllUserDecorations(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const userDecorations = await prisma.userDecoration.findMany({ where: { userId: userId }});
    const decorationIds = userDecorations?.map(ud => ud.decorationId);

    const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3011/shop';
    const decorationRequests = decorationIds?.map(id => fetch(`${SHOP_SERVICE_URL}/decorations/${id}`));
    const decorationResponses = await Promise.all(decorationRequests);

    decorationResponses.forEach(res => {
      if (!res.ok) throw new Error(`Failed to fetch decoration: ${res.status} ${res.statusText}`);
    });

    const decorations = await Promise.all(decorationResponses.map(decoration => decoration.json()));

    const decorationsResponse: DecorationsResponse = {
      meta: {
        count: decorations.length,
        title: `All decorations owned by user with id ${userId}`,
        url: req.url
      },
      data: decorations
    };
    return res.status(200).send(decorationsResponse);
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to retrieve decorations',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function placeDecoration(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  const decorationId = Number(req.body.decorationId);
  const placed = Boolean(req.body.placed);

  if (isNaN(userId) || isNaN(decorationId)) {
    return res.status(400).json({ message: 'Invalid userId or decorationId' });
  }

  try {
    const owned = await prisma.userDecoration.findUnique({
      where: { userId_decorationId: { userId, decorationId } }
    });

    if (!owned) {
      return res.status(400).json({ message: 'User doesn\'t own this decoration' });
    }

    await prisma.userDecoration.update({
      where: { userId_decorationId: { userId, decorationId } },
      data: { placed }
    });

    return res.status(200).json({ message: placed ? 'Decoration placed successfully' : 'Decoration removed successfully'});
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to place decoration' });
  }
};

export async function getPlacedDecorations(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }

  try {
    const placedDecorations = await prisma.userDecoration.findMany({
      where: { userId, placed: true },
      select: { decorationId: true }
    });

    const placedDecorationIds = placedDecorations.map(d => d.decorationId);

    return res.status(200).json({
      meta: {
        title: 'All placed decoration ids',
        count: placedDecorationIds.length,
        url: req.url
      }, data: { placedDecorationIds }
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to fetch placed decorations' });
  }
}

export async function buyDecoration(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  const decorationId = Number(req.body.decorationId);

  if (isNaN(userId) || isNaN(decorationId)) {
    return res.status(400).json({ message: 'Invalid userId or decorationId' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedDecorations: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const alreadyOwned = user.ownedDecorations.some(ud => ud.decorationId === decorationId);
    if (alreadyOwned) {
      return res.status(400).json({ message: 'User already owns this decoration' });
    }

    const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3011/shop';
    const decorationRes = await fetch(`${SHOP_SERVICE_URL}/decorations/${decorationId}`);

     if (!decorationRes.ok) {
      return res.status(404).json({ message: 'Decoration not found in shop service'});
    }

    const decorationJson = await decorationRes.json();
    const decoration = decorationJson.data;

    if (user.coins < decoration.price) {
      return res.status(400).json({ message: 'You don\'t have enough coins to purchase this decoration! Complete more quests to earn them!' });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: user.coins - decoration.price }
      }),
      prisma.userDecoration.create({
        data: { userId, decorationId }
      })
    ]);

    return res.status(200).json({
      message: 'Decoration purchased successfully!',
      newCoins: user.coins - decoration.price
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        message: 'Failed to purchase decoration',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}


