import { createPet, getAllPets } from "@/db/pets";
import { createPetSchema } from "@/lib/validations";

// GET /api/pets - Get all pets with their associated data
export async function GET() {
  try {
    const pets = await getAllPets();
    return Response.json({ pets });
  } catch (error) {
    console.error('Failed to fetch pets:', error);
    return Response.json({ error: 'Failed to fetch pets' }, { status: 500 });
  }
}
// POST /api/pets - Create pet with their associated data
export async function POST(request: Request) {
  try {
    const data = createPetSchema.parse(await request.json()); // throws ZodError if invalid
    const pet = await createPet(data); // data is typed as CreatePetInput
    return Response.json({ pet }, { status: 201 });
  } catch (error) {
    console.error('Failed to create pet:', error);
    return Response.json({ error: 'Failed to create pet' }, { status: 500 });
  }
}