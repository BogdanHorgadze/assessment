import { Appointment } from "@/entities/Appointment";
import { Repository } from "typeorm";
import {
  mockRepoAppointment,
  mockRepoAvailability,
} from "@/services/DoctorService.spec";
import { Availability } from "@/entities/Availability";

const createMockRepo = (mockRepository: Partial<Repository<any>>) => {
  return {
    has: () => true,
    get: () => ({
      getRepository: (name: string) => {
        console.log(name);
        return mockRepository;
      },
      getCustomRepository: (repositoryType: any) => {
        switch (repositoryType) {
          case Repository<Appointment>:
            return mockRepoAppointment;
          case Repository<Availability>:
            return mockRepoAvailability;
          default:
            console.warn(`No mock repository found for ${repositoryType}`);
            return null;
        }
      },
    }),
  };
};

export default createMockRepo;
