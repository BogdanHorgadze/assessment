import { Availability } from "./../entities/Availability";
import { Appointment } from "./../entities/Appointment";
import { Doctor } from "@/entities/Doctor";
import { Slot } from "@/models/appointments/Slot";
import { AddDoctorInput } from "@/models/doctor/AddDoctorInput";
import { Service } from "typedi";
import { Repository, MoreThanOrEqual, LessThanOrEqual, Raw } from "typeorm";
import { InjectRepository } from "typeorm-typedi-extensions";
import { getDay, differenceInWeeks, format } from "date-fns";
import getAllDoctorSlots from "@/helpers/getAllDoctorsSlots";
import getFilteredSlots from "@/helpers/getFilteredSlots";

@Service()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>,
    @InjectRepository(Availability)
    private readonly availabilityRepo: Repository<Availability>,
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>
  ) {}

  getDoctors() {
    return this.doctorRepo.find();
  }

  addDoctor(doctor: AddDoctorInput): Promise<Doctor> {
    return this.doctorRepo.save(doctor);
  }

  async getAvailableSlots(from: Date, to: Date): Promise<Slot[]> {
    const fromTime = format(from, "HH:mm");
    const toTime = format(to, "HH:mm");
    const fromDay = getDay(from);
    const toDay = getDay(to);

    const query =
      differenceInWeeks(to, from) >= 1
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
      relations: ["doctor"],
    });

    const appointments = await this.appointmentRepo.find({
      relations: ["doctor"],
    });

    return getFilteredSlots(appointments, getAllDoctorSlots(avalibleDoctors));
  }
}
