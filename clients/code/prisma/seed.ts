// import { PrismaClient } from '@prisma/client';
// // reference a type from the generated Prisma Client
// // import type { Client } from '@prisma/client';
// const prisma: PrismaClient = new PrismaClient();
// import { Owner, Pet } from './types.ts';

// // if you use the model you have to fill in all the fields also the generated ones
// const clients: Owner[] = [
//   {
//     name: 'Jane Doe',
//     email: 'jane@doe.com',
//   },
//   {
//     name: 'John Doe',
//     email: 'john@doe.com',
//   },
//   {
//     name: 'Mary Jane',
//     email: 'mary@jane.com',
//   },
// ];

// const pets: Pet[] = [
//   {
//     name: 'Fido',
//     specie: 'Dog',
//     breed: 'Labrador',
//     ownerId: 1,
//   },
//   {
//     name: 'Whiskers',
//     specie: 'Cat',
//     breed: 'Siamese',
//     ownerId: 2,
//   },
//   {
//     name: 'Rex',
//     specie: 'Dog',
//     breed: 'German Shepherd',
//     ownerId: 3,
//   },
//   {
//     name: 'Bella',
//     specie: 'Dog',
//     breed: 'Golden Retriever',
//     ownerId: 1,
//   },
//   {
//     name: 'Milo',
//     specie: 'Cat',
//     breed: 'Tabby',
//     ownerId: 2,
//   },
//   {
//     name: 'Luna',
//     specie: 'Dog',
//     breed: 'Poodle',
//     ownerId: 3,
//   },
//   {
//     name: 'Max',
//     specie: 'Dog',
//     breed: 'Bulldog',
//     ownerId: 1,
//   }
// ];

// const load = async (): Promise<void> => {
//   try {
//     await prisma.owner.createMany({
//       data: clients,
//     });
//     loadPets();
//     console.log('Added owner data');
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// const loadPets = async (): Promise<void> => {
//   try {
//     await prisma.pet.createMany({
//       data: pets,
//     });
//     console.log('Added pet data');
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// load();
