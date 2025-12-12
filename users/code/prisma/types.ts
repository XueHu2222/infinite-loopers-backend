interface User {
  id?: number;
  createdAt?: Date;
  username: string;
  email: string;
  password: string;
  coins: number;
  currentCharacterId: number;
  ownedCharacters?: UserCharacter[];
}

interface Character {
  id?: number;
  name: string;
  imageUrl: string;
  price: number;
  ownedBy?: UserCharacter[];
}

interface UserCharacter {
  userId: number;
  characterId: number;
  obtainedAt?: Date;
  user?: User;
  character?: Character;
}

export { User, Character, UserCharacter };
