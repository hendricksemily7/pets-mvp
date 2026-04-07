import { createVaccine } from "@/db/vaccines";
import { createVaccineSchema } from "@/lib/validations";

// POST /api/pets/[id]/vaccines - Add a vaccine to a pet
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: petId } = await params;
    const data = createVaccineSchema.parse(await request.json());
    const vaccine = await createVaccine(petId, data);
    return Response.json({ vaccine }, { status: 201 });
  } catch (error) {
    console.error("Failed to create vaccine:", error);
    return Response.json({ error: "Failed to create vaccine" }, { status: 500 });
  }
}
