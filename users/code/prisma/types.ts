/* eslint-disable @typescript-eslint/no-namespace */
interface User {
  id?: number;
  createdAt?: Date;
  email: string;
  username: string;
  password: string;
  coins: number;
  currentCharacterId: number;
  ownedCharacters?: UserCharacter[];
  ownedDecorations?: UserDecoration[];
  hasFinishedTour?: boolean;
  xp: number;
  level: number;
  maxXp: number;
}

interface UserCharacter {
  userId: number;
  characterId: number;
  obtainedAt?: Date;
  user?: User;
}

interface UserDecoration {
  userId: number;
  decorationId: number;
  obtainedAt?: Date;
  user?: User;
  placed: boolean;
}

export type { User, UserCharacter, UserDecoration };

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}
