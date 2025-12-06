/**
 * This file contains all the types that are used in the application
 *
 * It is a bit of a redundant file, because most of the types come from
 * the prima model. However, in this way we have more control over the
 * types that are used in the application. For example we want the id and
 * the createdAt field to be optional, it is genereated by Prisma/database.
 */

interface Appointment {
  id?: number,
  createdAt?: Date,
  appointmentDate: Date,
  status: string,
  pet_id: number,
  reason: string,
  timeslotId: number,
  locationId: number,
}

interface TimeSlot {
  id?: number,
  createdAt?: Date,
  starttime: string,
  endtime: string,
}

interface Location {
  id?: number,
  createdAt?: Date,
  name: string,
  address: string,
  city: string,
  state: string,
  zip: string,
  appointments?: Appointment[]
}

export { Appointment, TimeSlot, Location };
