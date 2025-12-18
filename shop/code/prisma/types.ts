interface Character {
  id?: number;
  name: string;
  imageUrl: string;
  price: number;
}

interface Decoration {
  id?: number;
  name: string;
  imageUrl: string;
  price: number;
  position: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
    translateX?: string;
    translateY?: string;
    width?: string;
  };
}

export { Character, Decoration };
