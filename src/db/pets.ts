import { prisma } from '@/lib/prisma';
import { CreatePetInput, UpdatePetInput } from '@/lib/validations';

// ============ Pet Functions ============
export async function getAllPets() {
  return prisma.pet.findMany({
    include: { allergies: true, vaccines: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getPetById(id: string) {
  return prisma.pet.findUnique({
    where: { id },
    include: { allergies: true, vaccines: true },
  });
}

export async function createPet(data: CreatePetInput) {
  return prisma.pet.create({
    data: {
      name: data.name,
      animalType: data.animalType,
      ownerName: data.ownerName,
      dateOfBirth: data.dateOfBirth,
      photoUrl: data.photoUrl,
    },
  });
}

export async function updatePet(id: string, data: UpdatePetInput) {
  return prisma.pet.update({
    where: { id },
    data,
  });
}

export async function deletePet(id: string) {
  return prisma.pet.delete({
    where: { id },
  });
}