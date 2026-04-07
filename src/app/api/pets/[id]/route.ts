import { deletePet, getPetById, updatePet } from "@/db/pets";
import { updatePetSchema } from "@/lib/validations";

// GET /api/pets/[id] - Get a single pet with all associated data
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pet = await getPetById(id);
    
    if (!pet) {
      return Response.json({ error: "Pet not found" }, { status: 404 });
    }
    
    return Response.json({ pet });
  } catch (error) {
    console.error("Failed to fetch pet:", error);
    return Response.json({ error: "Failed to fetch pet" }, { status: 500 });
  }
}

// PATCH /api/pets/[id] - Update a pet
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const data = updatePetSchema.parse(await request.json());
    const pet = await updatePet(id, data);
    return Response.json({ pet });
  } catch (error) {
    console.error("Failed to update pet:", error);
    return Response.json({ error: "Failed to update pet" }, { status: 500 });
  }
}

// DELETE /api/pets/[id] - Delete a pet
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deletePet(id);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete pet:", error);
    return Response.json({ error: "Failed to delete pet" }, { status: 500 });
  }
}
