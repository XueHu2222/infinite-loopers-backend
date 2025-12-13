import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();

interface CharactersResponse {
  meta: {
    count: number
    title: string
    url: string
  },
  data: number[]
}

export async function getUser(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await prisma.user.findFirst({ where: { id: userId }, include: {ownedCharacters: true}});

    // In order to remove the userId from the response
    const ownedCharacters = user.ownedCharacters.map(({ characterId, obtainedAt }) => ({
            characterId,
            obtainedAt
        }));

    return res.status(200).json({
      meta: {
        title: `User information`,
        url: req.url
      },
      data: {...user, ownedCharacters}
    });
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to retrieve user',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function getAllUserCharacters(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const userCharacters = await prisma.userCharacter.findMany({ where: { userId: userId }});
    const characterIds = userCharacters.map(uc => uc.characterId);

    const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3011/shop';
    const characterRequests = characterIds.map(id => fetch(`${SHOP_SERVICE_URL}/characters/${id}`));
    const characterResponses = await Promise.all(characterRequests);

    characterResponses.forEach(res => {
      if (!res.ok) throw new Error(`Failed to fetch character: ${res.status} ${res.statusText}`);
    });

    const characters = await Promise.all(characterResponses.map(character => character.json()));

    const charactersResponse: CharactersResponse = {
      meta: {
        count: characters.length,
        title: `All characters owned by user with id ${userId}`,
        url: req.url
      },
      data: characters
    };
    return res.status(200).send(charactersResponse);
  } catch (error) {
    return res.status(500).send({
      error: {
        message: 'Failed to retrieve characters',
        code: 'SERVER_ERROR',
        url: req.url
      }
    });
  }
}

export async function getCurrentCharacter(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ error: 'Invalid user ID' });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const currentCharacterId = user.currentCharacterId;
    const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3011/shop';
    const characterRes = await fetch(`${SHOP_SERVICE_URL}/characters/${currentCharacterId}`);
    if (!characterRes.ok) {
      return res.status(404).json({ message: "Character not found in shop service" });
    }
    const currentCharacter = await characterRes.json();

    return res.status(200).json({
      meta: {
        title: `The current character of user with id ${userId}`,
        url: req.url
      },
      data: currentCharacter
    });
  } catch (error) {
    return res.status(500).json({
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
  const characterId = Number(req.body.characterId);

  if (isNaN(userId) || isNaN(characterId)) {
    return res.status(400).json({ message: "Invalid userId or characterId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { ownedCharacters: true }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const alreadyOwned = user.ownedCharacters.some(uc => uc.characterId === characterId);
    if (alreadyOwned) {
      return res.status(400).json({ message: "User already owns this character" });
    }

    const SHOP_SERVICE_URL = process.env.SHOP_SERVICE_URL || 'http://localhost:3011/shop';
    const characterRes = await fetch(`${SHOP_SERVICE_URL}/characters/${characterId}`);

     if (!characterRes.ok) {
      return res.status(404).json({ message: "Character not found in shop service"});
    }

    const characterJson = await characterRes.json();
    const character = characterJson.data;

    if (user.coins < character.price) {
      return res.status(400).json({ message: "You don't have enough coins to purchase this character! Complete more quests to earn them!" });
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

export async function equipCharacter(req: Request, res: Response): Promise<Response> {
  const userId = Number(req.params.id);
  const characterId = Number(req.body.characterId);

  if (isNaN(userId) || isNaN(characterId)) {
    return res.status(400).json({ message: "Invalid userId or characterId" });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        currentCharacterId: characterId
      }
    });

    return res.status(200).json({
      message: "Character equipped successfully",
      currentCharacterId: characterId
    });
  } catch (error) {
    return res.status(500).json({
      error: {
        message: "Failed to equip character",
        code: "SERVER_ERROR",
        url: req.url
      }
    });
  }
}


