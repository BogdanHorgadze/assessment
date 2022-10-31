import { Appointment } from "@/entities/Appointment";
import { Slot } from "@/models/appointments/Slot";
import { addMinutes, format } from "date-fns";

function getFilteredSlots(appointments: Appointment[], slots: any[]) {
  const bookedSlots = appointments.map((a) => ({
    start: format(a.startTime, "HH:mm"),
    end: format(addMinutes(a.startTime, a.durationMinutes), "HH:mm"),
    doctorId: a.doctor.id,
  }));

  const filteredSlots = slots.filter((slot) =>
    bookedSlots.find((bookedSlot) => {
      if (
        slot.doctorId === bookedSlot.doctorId &&
        slot.start === bookedSlot.start
      ) {
        return false;
      }
      return true;
    })
  );

  const result = filteredSlots.map((slots) => ({
    ...slots,
    start: new Date(2022, 10, 8, Number(slots.start.split(":")[0]), Number(slots.start.split(":")[1]), 0, 0),
    end: new Date(2022, 10, 8, Number(slots.end.split(":")[0]), Number(slots.end.split(":")[1]), 0, 0),
  }));

  return result;
}

export default getFilteredSlots;
