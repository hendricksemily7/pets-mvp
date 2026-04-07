import { updateAllergy, deleteAllergy, getAllergyById } from "@/db/allergies";
import { updateAllergySchema } from "@/lib/validations";

// GET /api/pets/[id]/allergies/[allergyId] - Get a single allergy
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const { allergyId } = await params;
    const allergy = await getAllergyById(allergyId);
    
    if (!allergy) {
      return Response.json({ error: "Allergy not found" }, { status: 404 });
    }
    
    return Response.json({ allergy });
  } catch (error) {
    console.error("Failed to fetch allergy:", error);
    return Response.json({ error: "Failed to fetch allergy" }, { status: 500 });
  }
}

// PATCH /api/pets/[id]/allergies/[allergyId] - Update an allergy
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const { allergyId } = await params;
    const data = updateAllergySchema.parse(await request.json());
    const allergy = await updateAllergy(allergyId, data);
    return Response.json({ allergy });
  } catch (error) {
    console.error("Failed to update allergy:", error);
    return Response.json({ error: "Failed to update allergy" }, { status: 500 });
  }
}

// DELETE /api/pets/[id]/allergies/[allergyId] - Delete an allergy
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; allergyId: string }> }
) {
  try {
    const { allergyId } = await params;
    await deleteAllergy(allergyId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete allergy:", error);
    return Response.json({ error: "Failed to delete allergy" }, { status: 500 });
  }
}
