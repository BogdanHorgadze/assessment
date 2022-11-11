import { Appointment } from "@/entities/Appointment";
import { Slot } from "@/models/appointments/Slot";
import {
  addMinutes,
  format,
  getDay,
  set as setDate,
  eachDayOfInterval,
} from "date-fns";

function getFilteredSlots(
  appointments: Appointment[],
  slots: any[],
  from: Date,
  to: Date
) {
  const bookedSlots = appointments?.map((a) => ({
    dayOfWeek: getDay(a.startTime),
    doctorId: a.doctor.id,
    start: format(a.startTime, "HH:mm"),
    end: format(addMinutes(a.startTime, a.durationMinutes), "HH:mm"),
  }));

  const set = new Set();
  bookedSlots.forEach((slot) => set.add(JSON.stringify(slot)));
  const filteredSlots = slots.filter((slot) => !set.has(JSON.stringify(slot)));
  console.log(filteredSlots.length, "kkkkkk");
  const eachDay = eachDayOfInterval({
    start: from,
    end: to,
  });

  const result: Array<Slot> = [];
  eachDay.forEach((day, dayIdx) => {
    filteredSlots.forEach((slot) => {
      if (slot.dayOfWeek === getDay(day)) {
        const pushSlot = () => {
          result.push({
            doctorId: slot.doctorId,
            start: setDate(day, {
              hours: slot.start.split(":")[0],
              minutes: slot.start.split(":")[1],
            }),
            end: setDate(day, {
              hours: slot.end.split(":")[0],
              minutes: slot.end.split(":")[1],
            }),
          });
        };
        if (dayIdx === eachDay.length - 1) {
          const slotEnd = setDate(day, {
            hours: slot.end.split(":")[0],
            minutes: slot.end.split(":")[1],
          });
          if (slotEnd <= to) {
            pushSlot();
          }
        } else {
          pushSlot();
        }
      }
    });
  });
  return result;
}

export default getFilteredSlots;
