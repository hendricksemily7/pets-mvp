import {prisma} from '@/lib/prisma';
import {CreateVaccineInput, UpdateVaccineInput} from '@/lib/validations';

// ============ Vaccine Functions ============

export async function getVaccinesForPet(petId: string) {
  return prisma.vaccine.findMany({
    where: { petId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getVaccineById(id: string) {
  return prisma.vaccine.findUnique({
    where: { id },
  });
}

export async function createVaccine(petId: string, data: CreateVaccineInput) {
  return prisma.vaccine.create({
    data: {
      petId,
      name: data.name,
      dateAdministered: data.dateAdministered,
      intervalMonths: data.intervalMonths,
    },
  });
}        

