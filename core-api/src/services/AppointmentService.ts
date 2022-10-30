import { Appointment } from '@/entities/Appointment';
import { Doctor } from '@/entities/Doctor';
import { BookAppointmentInput } from '@/models/appointments/BookAppointmentInput';
import { Service } from 'typedi';
import { Repository } from 'typeorm';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepo: Repository<Appointment>,
    @InjectRepository(Doctor)
    private readonly doctorRepo: Repository<Doctor>
  ) {}

  getAppointments(): Promise<Appointment[]> {
    return this.appointmentRepo.find();
  }

  async bookAppointment(options: BookAppointmentInput): Promise<Appointment> {
    try {
      const {
        slot: { doctorId, start },
      } = options;
      const isExist = await this.appointmentRepo.findOne({
        where: { startTime: start, doctor: doctorId },
      });
      if (!isExist) {
        const doctor = await this.doctorRepo.findOne({ id: doctorId });
        const appoitment = new Appointment();
        appoitment.startTime = start;
        appoitment.durationMinutes = 15;
        appoitment.doctor = doctor;
        return this.appointmentRepo.save(appoitment);
      }
      throw new Error('Appointment slot already taken');
    } catch (e) {
      throw new Error(e.message);
    }
  }
}
