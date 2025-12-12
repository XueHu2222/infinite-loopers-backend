import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { Character, User } from '../../prisma/types.ts';
const prisma: PrismaClient = new PrismaClient();

interface CharactersResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: Character[]
}

export async function getAllCharacters(req: Request, res: Response): Promise<void> {
  try {
    const allCharacters = await prisma.character.findMany();
    const charactersResponse: CharactersResponse = {
      meta: {
        count: allCharacters.length,
        title: `All characters available in the store`,
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

export async function getUser(req: Request, res: Response): Promise<void> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const user = await prisma.user.findFirst({ where: { id: userId }, include: {ownedCharacters: true} });
    res.status(200).json({
      success: true,
      title: `User information`,
      data: user
    });
  } catch (error) {
    res.status(500).send({
      error: {
        message: 'Failed to retrieve user',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function getAllUserCharacters(req: Request, res: Response): Promise<void> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const userCharacters = await prisma.userCharacter.findMany({ where: { userId: userId }, include: { character: true } });
    const characters: Character[] = userCharacters.map(uc => uc.character);
    const charactersResponse: CharactersResponse = {
      meta: {
        count: characters.length,
        title: `All characters that user with id ${userId} owns`,
        url: req.url
      },
      data: characters
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

export async function getCurrentCharacter(req: Request, res: Response): Promise<void> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    res.status(400).json({ error: 'Invalid user ID' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    const currentCharacter = await prisma.character.findUnique({
      where: { id: user.currentCharacterId }
    });

    res.status(200).json({
      success: true,
      title: `Current character of user ${userId}`,
      data: currentCharacter
    });
  } catch (error) {
    res.status(500).json({
      error: {
        message: 'Failed to retrieve current character',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function buyCharacter(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  const characterId = req.body.characterId;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedCharacters: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId }
    });

    if (!character) {
      return res.status(404).json({ message: "Character not found" });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: userId },
        data: { coins: user.coins - character.price }
      }),
      prisma.userCharacter.create({
        data: { userId, characterId }
      })
    ]);

    return res.status(200).json({
      message: "Character purchased successfully!",
      newCoins: user.coins - character.price
    });

  } catch (error) {
    return res.status(500).json({
      error: {
        message: "Failed to purchase character",
        code: "SERVER_ERROR",
        url: req.url
      }
    });
  }
}

