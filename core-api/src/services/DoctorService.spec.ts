import { Appointment } from "@/entities/Appointment";
import { Availability } from "@/entities/Availability";
import { Doctor } from "@/entities/Doctor";
import createMockRepo from "@test/mocks/mockRepo";
import { addDays, nextMonday, setHours, setMinutes } from "date-fns";
import Container from "typedi";
import { ConnectionManager, Repository } from "typeorm";
import { DoctorService } from "./DoctorService";

export const mockRepoAvailability: Partial<Repository<Availability>> = {};
export const mockRepoAppointment: Partial<Repository<Appointment>> = {};

describe("DoctorService", () => {
  beforeAll(() => {
    Container.set(ConnectionManager, {
      has: () => true,
      get: () => ({
        getRepository: (repositoryType: any) => {
          switch (repositoryType) {
            case Appointment:
              return mockRepoAppointment;
            case Availability:
              return mockRepoAvailability;
            default:
              console.warn(`No mock repository found for ${repositoryType}`);
              return null;
          }
        },
      }),
    });
  });

  describe("slots query", () => {
    it("should return all slots for doctor", async () => {
      const doctor = new Doctor();
      doctor.id = 1;
      doctor.name = "doctor1";
      doctor.availability = [
        {
          dayOfWeek: 1, // Monday
          startTimeUtc: "09:00",
          endTimeUtc: "17:00",
        },
        {
          dayOfWeek: 2, // Tuesday
          startTimeUtc: "09:00",
          endTimeUtc: "12:00",
        },
        {
          dayOfWeek: 2, // Tuesday
          startTimeUtc: "14:00",
          endTimeUtc: "17:00",
        },
      ].map((a) => {
        const availability = new Availability();
        availability.doctor = doctor;
        availability.dayOfWeek = a.dayOfWeek;
        availability.startTimeUtc = a.startTimeUtc;
        availability.endTimeUtc = a.endTimeUtc;
        return availability;
      });

      mockRepoAvailability.find = jest.fn(() => {
        return Promise.resolve(doctor.availability);
      });

      mockRepoAppointment.find = jest.fn(() => {
        return Promise.resolve([]);
      });

      const sut = Container.get(DoctorService);

      // from 9am next monday
      const from = setMinutes(
        setHours(nextMonday(new Date()), 9),
        0
      );
      const to = addDays(from, 7);
      const slots = await sut.getAvailableSlots(doctor.id, from, to);

      const slotsOnMonday = ((17 - 9) * 60) / 15;
      const slotsOnTuesdayMorning = ((12 - 9) * 60) / 15;
      const slotsOnTuesdayAfternoon = ((17 - 14) * 60) / 15;
      const totalSlots =
        slotsOnMonday + slotsOnTuesdayAfternoon + slotsOnTuesdayMorning;

      expect(slots.length).toBe(totalSlots);
    });

    it('should not return slot if appointment exists for doctor', async () => {
      const doctor = new Doctor();
      doctor.id = 1;
      doctor.name = "doctor1";
      doctor.availability = [
        {
          dayOfWeek: 1,
          startTimeUtc: '09:00',
          endTimeUtc: '17:00',
        },
        {
          dayOfWeek: 2,
          startTimeUtc: '09:00',
          endTimeUtc: '12:00',
        },
        {
          dayOfWeek: 2,
          startTimeUtc: '14:00',
          endTimeUtc: '17:00',
        },
      ].map((a) => {
        const availability = new Availability();
        availability.doctor = doctor;
        availability.dayOfWeek = a.dayOfWeek;
        availability.startTimeUtc = a.startTimeUtc;
        availability.endTimeUtc = a.endTimeUtc;
        return availability;
      });

      const appointment = new Appointment();

      // set appointment start time to next monday at 2pm
      const startTime = setMinutes(
        setHours(addDays(nextMonday(new Date()), 1), 14),
        0
      );
      appointment.doctor = doctor;
      appointment.startTime = startTime;
      appointment.durationMinutes = 15;
      doctor.appointments = [appointment];

      mockRepoAvailability.find = jest.fn(() => {
        return Promise.resolve(doctor.availability);
      });

      mockRepoAppointment.find = jest.fn(() => {
        return Promise.resolve([appointment]);
      });

      const sut = Container.get(DoctorService);

      // from 9am next monday
      const from = setMinutes(
        setHours(nextMonday(new Date()), 9),
        0
      );
      const to = addDays(from, 7);
      const slots = await sut.getAvailableSlots(doctor.id, from, to);

      const slotsOnMonday = ((17 - 9) * 60) / 15;
      const slotsOnTuesdayMorning = ((12 - 9) * 60) / 15;
      const slotsOnTuesdayAfternoon = ((17 - 14) * 60) / 15;
      const totalSlots =
        slotsOnMonday + slotsOnTuesdayAfternoon + slotsOnTuesdayMorning;

      // expect there to be 1 less slot
      expect(slots.length).toBe(totalSlots - 1);
    });
  });
});
