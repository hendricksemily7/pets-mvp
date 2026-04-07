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
      isRecurring: data.isRecurring,
      intervalMonths: data.intervalMonths,
      documentUrl: data.documentUrl,
    },
  });
}

export async function updateVaccine(id: string, data: UpdateVaccineInput) {
  return prisma.vaccine.update({
    where: { id },
    data,
  });
}

export async function deleteVaccine(id: string) {
  return prisma.vaccine.delete({
    where: { id },
  });
}        

