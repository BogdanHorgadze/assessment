const timeToMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (totalMinutes: number) => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return [hours, minutes]
    .map((number) => String(number).padStart(2, '0'))
    .join(':');
};

const intervals = (start: number, end: number, interval: number) =>
  Array.from({ length: Math.floor((end - start) / interval) }, (_, number) => [
    start + interval * number,
    start + interval * (number + 1),
  ]);

const getAllDoctorSlots = (
  doctors: { id: number; startTimeUtc: string; endTimeUtc: string }[],
  interval = 15
) =>
  doctors.flatMap(({ id, startTimeUtc, endTimeUtc }) =>
    intervals(
      timeToMinutes(startTimeUtc),
      timeToMinutes(endTimeUtc),
      interval
    ).map(([start, end]) => ({
      doctorId: id,
      start: minutesToTime(start),
      end: minutesToTime(end),
    }))
  );

export default getAllDoctorSlots
