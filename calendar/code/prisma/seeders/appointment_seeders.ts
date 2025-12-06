import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();
import { Appointment } from '../types.ts';

const appointments: Appointment[] = [
  {
    appointmentDate: new Date('2024-10-02'),
    status: 'pending',
    pet_id: 1,
    reason: 'Regular check-up',
    timeslotId: 1,
    locationId: 1,
  },
  {
    appointmentDate: new Date('2024-10-02'),
    status: 'confirmed',
    pet_id: 2,
    reason: 'Vaccination',
    timeslotId: 2,
    locationId: 1,
  },
  {
    appointmentDate: new Date('2024-10-02'),
    status: 'pending',
    pet_id: 3,
    reason: 'Dental cleaning',
    timeslotId: 3,
    locationId: 2,
  },
  {
    appointmentDate: new Date('2024-10-05'),
    status: 'cancelled',
    pet_id: 4,
    reason: 'Emergency visit',
    timeslotId: 4,
    locationId: 2,
  },
  // {
  //   appointmentDate: new Date('2024-10-05'),
  //   status: 'confirmed',
  //   pet_id: 5,
  //   reason: 'Follow-up',
  //   timeslotId: 5,
  //   locationId: 1,
  // },
  // {
  //   appointmentDate: new Date('2024-10-05'),
  //   status: 'pending',
  //   pet_id: 6,
  //   reason: 'Surgery consultation',
  //   timeslotId: 6,
  //   locationId: 3,
  // },
  // {
  //   appointmentDate: new Date('2024-10-10'),
  //   status: 'pending',
  //   pet_id: 7,
  //   reason: 'Grooming',
  //   timeslotId: 1,
  //   locationId: 3,
  // },
  // {
  //   appointmentDate: new Date('2024-10-10'),
  //   status: 'confirmed',
  //   pet_id: 8,
  //   reason: 'Health check',
  //   timeslotId: 2,
  //   locationId: 2,
  // },
  // {
  //   appointmentDate: new Date('2024-10-10'),
  //   status: 'pending',
  //   pet_id: 9,
  //   reason: 'Vaccination',
  //   timeslotId: 3,
  //   locationId: 1,
  // },
];


export const loadAppointments = async (): Promise<void> => {
  try {
    await prisma.appointment.createMany({
      data: appointments,
    });
    console.log('Added appointment data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
