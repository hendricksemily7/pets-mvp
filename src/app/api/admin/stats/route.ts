import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get all pets with their vaccines and allergies
    const pets = await prisma.pet.findMany({
      include: {
        vaccines: true,
        allergies: true,
      },
    });

    // Total counts
    const totalPets = pets.length;
    const totalVaccines = pets.reduce((sum, pet) => sum + pet.vaccines.length, 0);
    const totalAllergies = pets.reduce((sum, pet) => sum + pet.allergies.length, 0);

    // Pets by animal type
    const petsByType: Record<string, number> = {};
    pets.forEach((pet) => {
      const type = pet.animalType.toLowerCase();
      petsByType[type] = (petsByType[type] || 0) + 1;
    });

    // Severe allergies count
    const severeAllergies = pets.reduce(
      (sum, pet) =>
        sum + pet.allergies.filter((a) => a.severity === "severe").length,
      0
    );

    // Upcoming vaccines (recurring vaccines due in the next 30 days)
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    const upcomingVaccines: Array<{
      petName: string;
      petId: string;
      vaccineName: string;
      dueDate: Date;
    }> = [];

    pets.forEach((pet) => {
      pet.vaccines.forEach((vaccine) => {
        if (vaccine.isRecurring && vaccine.intervalMonths) {
          const lastDate = new Date(vaccine.dateAdministered);
          const dueDate = new Date(lastDate);
          dueDate.setMonth(dueDate.getMonth() + vaccine.intervalMonths);
          
          if (dueDate >= now && dueDate <= thirtyDaysFromNow) {
            upcomingVaccines.push({
              petName: pet.name,
              petId: pet.id,
              vaccineName: vaccine.name,
              dueDate,
            });
          }
        }
      });
    });

    // Sort upcoming vaccines by due date
    upcomingVaccines.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    // Recent pets (last 5 added)
    const recentPets = pets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map((pet) => ({
        id: pet.id,
        name: pet.name,
        animalType: pet.animalType,
        ownerName: pet.ownerName,
        createdAt: pet.createdAt,
      }));

    // Pets with most allergies (for attention)
    const petsWithAllergies = pets
      .filter((pet) => pet.allergies.length > 0)
      .sort((a, b) => b.allergies.length - a.allergies.length)
      .slice(0, 5)
      .map((pet) => ({
        id: pet.id,
        name: pet.name,
        animalType: pet.animalType,
        allergyCount: pet.allergies.length,
        severeCount: pet.allergies.filter((a) => a.severity === "severe").length,
      }));

    // All pets for table display
    const allPets = pets
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .map((pet) => ({
        id: pet.id,
        name: pet.name,
        animalType: pet.animalType,
        ownerName: pet.ownerName,
        dateOfBirth: pet.dateOfBirth,
        vaccineCount: pet.vaccines.length,
        allergyCount: pet.allergies.length,
        createdAt: pet.createdAt,
      }));

    return NextResponse.json({
      totalPets,
      totalVaccines,
      totalAllergies,
      severeAllergies,
      petsByType,
      upcomingVaccines,
      recentPets,
      petsWithAllergies,
      allPets,
    });
  } catch (error) {
    console.error("Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
