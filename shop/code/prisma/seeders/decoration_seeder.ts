import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();

 const decorations = [
    {
      name: 'Serpentleaf Plant',
      imageUrl: '/decorations/serpentleaf-plant.png',
      price: 15,
      position: { bottom: '33%', left: '26%', width: '12%' }
    },
    {
      name: 'Enchanted Painting',
      imageUrl: '/decorations/enchanted-painting.png',
      price: 50,
      position: { bottom: '50%', left: '30%', width: '12%' }
    },
    {
      name: 'Magic Carpet',
      imageUrl: '/decorations/magic-carpet.png',
      price: 250,
      position: { bottom: '15%', left: '50%', width: '40%', translateX: '-50%' }
    },
    {
      name: 'Arcane Shelf',
      imageUrl: '/decorations/arcane-shelf.png',
      price: 450,
      position: { top: '50%', right: '20%', width: '20%' }
    },
    {
      name: 'Study Table',
      imageUrl: '/decorations/study-table.png',
      price: 700,
      position: { top: '36%', left: '25%', width: '40%' }
    }
  ];

export const loadDecorations = async (): Promise<void> => {
  try {
    for (const deco of decorations) {
      await prisma.decoration.upsert({
        where: { name: deco.name },
        update: {},
        create: deco,
      });
    }
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
