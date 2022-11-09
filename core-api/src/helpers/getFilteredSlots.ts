import { Appointment } from "@/entities/Appointment";
import { Slot } from "@/models/appointments/Slot";
import { addMinutes, format, getDay, setDay, set as setDate } from "date-fns";

function getFilteredSlots(appointments: Appointment[], slots: any[]) {
  const bookedSlots = appointments?.map((a) => ({
    dayOfWeek: getDay(a.startTime),
    doctorId: a.doctor.id,
    start: format(a.startTime, "HH:mm"),
    end: format(addMinutes(a.startTime, a.durationMinutes), "HH:mm"),
  }));

  const set = new Set();
  bookedSlots.forEach((slot) => set.add(JSON.stringify(slot)));
  const filteredSlots = slots.filter((slot) => !set.has(JSON.stringify(slot)));

  const result = filteredSlots.map(({ doctorId, dayOfWeek, start, end }) => ({
    doctorId,
    start: setDate(setDay(new Date(), dayOfWeek, { weekStartsOn: 1 }), {
      hours: start.split(":")[0],
      minutes: start.split(":")[1],
    }),
    end: setDate(setDay(new Date(), dayOfWeek, { weekStartsOn: 1 }), {
      hours: end.split(":")[0],
      minutes: end.split(":")[1],
    }),
  }));

  return result;
}

export default getFilteredSlots;
