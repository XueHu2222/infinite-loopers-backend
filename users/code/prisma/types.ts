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
  placed: Boolean;
}

export { User, UserCharacter, UserDecoration };

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
      };
    }
  }
}
