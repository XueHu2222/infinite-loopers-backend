import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();
import { Location } from '../types.ts';

const locations: Location[] = [
  {
    name: 'Happy Pets Clinic',
    address: '123 Pet Lane',
    city: 'Petville',
    state: 'CA',
    zip: '90210',
  },
  {
    name: 'Furry Friends Vet',
    address: '456 Animal Ave',
    city: 'Dogtown',
    state: 'TX',
    zip: '73301',
  },

];

export const loadLocations = async (): Promise<void> => {
  try {
    await prisma.location.createMany({
      data: locations,
    });
    console.log('Added location data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
