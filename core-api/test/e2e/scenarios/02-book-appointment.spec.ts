import { faker } from "@faker-js/faker";
import { addDays, nextMonday, setHours, setMinutes } from "date-fns";
import { Doctor } from "@/entities/Doctor";

import { createApi } from "../api";

import { fetchSlots } from "../commands/doctors";
import { bookAppointment } from "../commands/appointments";
import { BookAppointmentInput } from "@/models/appointments/BookAppointmentInput";
import { Appointment } from "@/entities/Appointment";
import { Slot } from "@/models/appointments/Slot";

const api = createApi();

describe("Book appointment scenario", () => {
  it("should book appointment successfully", async () => {
    const doctor = new Doctor()
    doctor.name = 'doctor'
    doctor.id = 1;
    const from = setMinutes(setHours(addDays(nextMonday(new Date()), 3), 9), 0);
    const to = addDays(from, 7);
    const slotsRes = await fetchSlots(api, doctor.id, to, from);
    
    const slots = slotsRes.body.data.slots as Slot[];
    const selectedSlot = slots[0];

    const bookAppointmentInput: BookAppointmentInput = {
      slot: selectedSlot,
      patientName: faker.name.firstName(),
      description: faker.lorem.lines(5),
    };

    const appointmentRes = await bookAppointment(api, bookAppointmentInput);
    const errors = appointmentRes.body.errors;
    if (errors) {
      expect(errors[0].message).not.toBe("Appointment slot already taken");
      return;
    }
    const appointment = appointmentRes.body.data.bookAppointment as Appointment;

    expect(appointment.startTime).toBe(selectedSlot.start);
    expect(appointment.doctor.id).toBe(selectedSlot.doctorId);
  });
});
