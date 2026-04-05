import { prisma } from '@/lib/prisma';
import { CreateAllergyInput, UpdateAllergyInput } from '@/lib/validations';

// ============ Allergies Functions ============

export async function getAllergiesForPet(petId: string) {
  return prisma.allergy.findMany({
    where: { petId },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getAllergyById(id: string) {
  return prisma.allergy.findUnique({
    where: { id },
  });
}

export async function createAllergy(petId: string, data: CreateAllergyInput) {
  return prisma.allergy.create({
    data: {
      petId,
      name: data.name,
      reactions: data.reactions,
      severity: data.severity,
    },
  });
}

export async function updateAllergy(id: string, data: UpdateAllergyInput) {
  return prisma.allergy.update({
    where: { id },
    data,
  });
}

export async function deleteAllergy(id: string) {
  return prisma.allergy.delete({
    where: { id },
  });
}