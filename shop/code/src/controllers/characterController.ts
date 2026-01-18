/* eslint-disable @typescript-eslint/no-unused-vars */
import { PrismaClient } from '@prisma/client';
import { Request, Response } from 'express';
import { Character } from '../../prisma/types.ts';
const prisma: PrismaClient = new PrismaClient();

interface CharactersResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: Character[]
}

export async function getCharacter(req: Request, res: Response): Promise<Response> {
  const characterId = Number(req.params.id);
  if (isNaN(characterId)) {
    return res.status(400).json({ error: 'Invalid character ID' });
  }

  try {
    const character = await prisma.character.findFirst({ where: { id: characterId }});
    return res.status(200).json({
      meta: {
        title: 'Character information',
        url: req.url
      },
      data: character
    });
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to retrieve character',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function getAllCharacters(req: Request, res: Response): Promise<void> {
  try {
    const allCharacters = await prisma.character.findMany();
    const charactersResponse: CharactersResponse = {
      meta: {
        count: allCharacters.length,
        title: 'All characters available in the store',
        url: req.url
      },
      data: allCharacters
    };
    res.status(200).send(charactersResponse);
  } catch (error) {
    res.status(500).send({
      error: {
        message: 'Failed to retrieve characters',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}
