// GET /api/allergies - Get all allergies from the database
import { getAllAllergyNames } from '@/db/allergyName';

export async function GET() {
  try {
    const allergyNames = await getAllAllergyNames();
    return Response.json({ allergyNames });
  } catch (error) {
    console.error('Failed to fetch allergies:', error);
    return Response.json({ error: 'Failed to fetch allergies' }, { status: 500 });
  }
}

