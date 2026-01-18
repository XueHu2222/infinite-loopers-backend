/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Decoration } from '../../prisma/types.ts';
const prisma: PrismaClient = new PrismaClient();

interface DecorationsResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: Decoration[]
}

export async function getDecoration(req: Request, res: Response): Promise<Response> {
  const decorationId = Number(req.params.id);
  if (isNaN(decorationId)) {
    return res.status(400).json({ error: 'Invalid decoration ID' });
  }

  try {
    const decoration = await prisma.decoration.findFirst({ where: { id: decorationId }});
    return res.status(200).json({
      meta: {
        title: 'Decoration information',
        url: req.url
      },
      data: decoration
    });
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to retrieve decoration',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function getAllDecorations(req: Request, res: Response): Promise<void> {
  try {
    const allDecorations = await prisma.decoration.findMany();
    const decorationsResponse: DecorationsResponse = {
      meta: {
        count: allDecorations.length,
        title: 'All decorations available in the store',
        url: req.url
      },
      data: allDecorations.map(dec => ({...dec, position: dec.position as Decoration['position']}))
    };
    res.status(200).send(decorationsResponse);
  } catch (error) {
    res.status(500).send({
      error: {
        message: 'Failed to retrieve decorations',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}
