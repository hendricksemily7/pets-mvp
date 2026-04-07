import { createAllergy } from "@/db/allergies";
import { createAllergySchema } from "@/lib/validations";

// POST /api/pets/[id]/allergies - Add an allergy to a pet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params;
    const data = createAllergySchema.parse(await request.json());
    const allergy = await createAllergy(petId, data);
    return Response.json({ allergy }, { status: 201 });
  } catch (error) {
    console.error("Failed to create allergy:", error);
    return Response.json({ error: "Failed to create allergy" }, { status: 500 });
  }
}
