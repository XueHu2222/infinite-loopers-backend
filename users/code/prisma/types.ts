interface User {
  id?: number;
  createdAt?: Date;
  email: string;
  username: string;
  password: string;
  coins: number;
  currentCharacterId: number;
  ownedCharacters?: UserCharacter[];
}

interface UserCharacter {
  userId: number;
  characterId: number;
  obtainedAt?: Date;
  user?: User;
}

export { User, UserCharacter };
