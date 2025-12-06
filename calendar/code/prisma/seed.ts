// import { PrismaClient } from '@prisma/client';
// const prisma: PrismaClient = new PrismaClient();
// import { loadLocations } from './seeders/location_seeder.ts';
// import { loadTimeSlots } from './seeders/timeslot_seeder.ts';
// import { loadAppointments } from './seeders/appointment_seeders.ts';

// const load = async (): Promise<void> => {
//   try {
//     await loadLocations();
//     await loadTimeSlots();
//     await loadAppointments();
//   } catch (e) {
//     console.error(e);
//     process.exit(1);
//   } finally {
//     await prisma.$disconnect();
//   }
// };

// load();
