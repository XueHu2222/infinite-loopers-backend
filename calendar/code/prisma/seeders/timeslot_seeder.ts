import { PrismaClient } from '@prisma/client';
const prisma: PrismaClient = new PrismaClient();
import { TimeSlot } from '../types.ts';

const timeSlots: TimeSlot[] = [
  {
    starttime: '09:00',
    endtime: '09:15',
  },
  {
    starttime: '09:15',
    endtime: '09:30',
  },
  {
    starttime: '09:30',
    endtime: '09:45',
  },
  {
    starttime: '09:45',
    endtime: '10:00',
  },
  {
    starttime: '10:00',
    endtime: '10:15',
  },
  {
    starttime: '10:15',
    endtime: '10:30',
  },
  {
    starttime: '10:30',
    endtime: '10:45',
  },
  {
    starttime: '10:45',
    endtime: '11:00',
  },
  {
    starttime: '11:00',
    endtime: '11:15',
  },
  {
    starttime: '11:15',
    endtime: '11:30',
  },
  {
    starttime: '11:30',
    endtime: '11:45',
  },
  {
    starttime: '11:45',
    endtime: '12:00',
  },
  {
    starttime: '12:00',
    endtime: '12:15',
  },
  {
    starttime: '12:15',
    endtime: '12:30',
  },
  {
    starttime: '12:30',
    endtime: '12:45',
  },
  {
    starttime: '12:45',
    endtime: '13:00',
  },
];

// first look if the exist in the database and then add them
export const loadTimeSlots = async (): Promise<void> => {
  try {
    await prisma.timeslot.createMany({
      data: timeSlots,
    });
    console.log('Added timeslot data');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};
