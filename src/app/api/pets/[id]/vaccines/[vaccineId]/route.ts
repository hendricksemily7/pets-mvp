import { updateVaccine, deleteVaccine, getVaccineById } from "@/db/vaccines";
import { updateVaccineSchema } from "@/lib/validations";

// GET /api/pets/[id]/vaccines/[vaccineId] - Get a single vaccine
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  try {
    const { vaccineId } = await params;
    const vaccine = await getVaccineById(vaccineId);
    
    if (!vaccine) {
      return Response.json({ error: "Vaccine not found" }, { status: 404 });
    }
    
    return Response.json({ vaccine });
  } catch (error) {
    console.error("Failed to fetch vaccine:", error);
    return Response.json({ error: "Failed to fetch vaccine" }, { status: 500 });
  }
}

// PATCH /api/pets/[id]/vaccines/[vaccineId] - Update a vaccine
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  try {
    const { vaccineId } = await params;
    const data = updateVaccineSchema.parse(await request.json());
    const vaccine = await updateVaccine(vaccineId, data);
    return Response.json({ vaccine });
  } catch (error) {
    console.error("Failed to update vaccine:", error);
    return Response.json({ error: "Failed to update vaccine" }, { status: 500 });
  }
}

// DELETE /api/pets/[id]/vaccines/[vaccineId] - Delete a vaccine
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; vaccineId: string }> }
) {
  try {
    const { vaccineId } = await params;
    await deleteVaccine(vaccineId);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete vaccine:", error);
    return Response.json({ error: "Failed to delete vaccine" }, { status: 500 });
  }
}
