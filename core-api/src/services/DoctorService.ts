import { Availability } from './../entities/Availability';
import { Doctor } from '@/entities/Doctor';
import { Slot } from '@/models/appointments/Slot';
import { AddDoctorInput } from '@/models/doctor/AddDoctorInput';
import { Service } from 'typedi';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Raw } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { getDay, differenceInCalendarWeeks, format } from 'date-fns';
import getAllDoctorSlots from '@/helpers/getAllDoctorsSlots';
@Service()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>
  ) {}

  getDoctors() {
    return this.doctorRepo.find();
  }

  addDoctor(doctor: AddDoctorInput): Promise<Doctor> {
    return this.doctorRepo.save(doctor);
  }

  async getAvailableSlots(from: Date, to: Date): Promise<Slot[]> {
    const fromTime = format(from, 'HH:mm');
    const toTime = format(to, 'HH:mm');
    const fromDay = getDay(from);
    const toDay = getDay(to);
    const query =
      differenceInCalendarWeeks(to, from) >= 1
        ? []
        : [
            {
              dayOfWeek: Raw(
                (alias) => `${alias} > ${fromDay} AND ${alias} < ${toDay}`
              ),
            },
            {
              dayOfWeek: fromDay,
              endTimeUtc: MoreThanOrEqual(fromTime),
            },
            {
              dayOfWeek: toDay,
              startTimeUtc: LessThanOrEqual(toTime),
            },
          ];
    const avalibleDoctors = await this.availabilityRepo.find({
      where: [...query],
    });

    return getAllDoctorSlots(avalibleDoctors);
  }
}
