import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();

const characters = [
  { name: 'Silver Knight', imageUrl: '/characters/silver-knight.png' },
  { name: 'Elder Wizard', imageUrl: '/characters/elder-wizard.png', price: 90 },
  { name: 'The Grey Wizard', imageUrl: '/characters/the-grey-wizard.png', price: 200 },
  { name: 'Ice Mage', imageUrl: '/characters/ice-mage.png', price: 300 },
  { name: 'Apprentice Mage', imageUrl: '/characters/apprentice-mage.png', price: 450 },
  { name: 'Rogue Scout', imageUrl: '/characters/rogue-scout.png', price: 600 }
];

export const loadCharacters = async (): Promise<void> => {
  try {
    for (const char of characters) {
      await prisma.character.upsert({
        where: { name: char.name },
        update: {},
        create: char,
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
