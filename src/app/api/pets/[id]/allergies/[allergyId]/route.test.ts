import { GET, PATCH, DELETE } from './route';
import * as allergiesDb from '@/db/allergyName';

// Mock the database functions
jest.mock('@/db/allergies');

const mockAllergy = {
  id: 'a1',
  petId: '1',
  name: 'Peanuts',
  reactions: ['Itching', 'Swelling'],
  severity: 'severe',
  documentUrl: null,
};

// Helper to create params promise (Next.js 15 style)
const createParams = (id: string, allergyId: string) => Promise.resolve({ id, allergyId });

describe('/api/pets/[id]/allergies/[allergyId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns an allergy by id', async () => {
      (allergiesDb.getAllergyById as jest.Mock).mockResolvedValue(mockAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies/a1');
      const response = await GET(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.allergy.name).toBe('Peanuts');
      expect(data.allergy.severity).toBe('severe');
      expect(allergiesDb.getAllergyById).toHaveBeenCalledWith('a1');
    });

    it('returns 404 when allergy not found', async () => {
      (allergiesDb.getAllergyById as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/pets/1/allergies/a999');
      const response = await GET(request, { params: createParams('1', 'a999') });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Allergy not found');
    });

    it('returns 500 on database error', async () => {
      (allergiesDb.getAllergyById as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/allergies/a1');
      const response = await GET(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch allergy');
    });
  });

  describe('PATCH', () => {
    it('updates an allergy name', async () => {
      const updatedAllergy = { ...mockAllergy, name: 'Tree Nuts' };
      (allergiesDb.updateAllergy as jest.Mock).mockResolvedValue(updatedAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies/a1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Tree Nuts' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.allergy.name).toBe('Tree Nuts');
      expect(allergiesDb.updateAllergy).toHaveBeenCalledWith('a1', { name: 'Tree Nuts' });
    });

    it('updates severity', async () => {
      const updatedAllergy = { ...mockAllergy, severity: 'mild' };
      (allergiesDb.updateAllergy as jest.Mock).mockResolvedValue(updatedAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies/a1', {
        method: 'PATCH',
        body: JSON.stringify({ severity: 'mild' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'a1') });

      expect(response.status).toBe(200);
      expect(allergiesDb.updateAllergy).toHaveBeenCalledWith('a1', { severity: 'mild' });
    });

    it('updates reactions array', async () => {
      const updatedAllergy = { ...mockAllergy, reactions: ['Hives', 'Difficulty breathing'] };
      (allergiesDb.updateAllergy as jest.Mock).mockResolvedValue(updatedAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies/a1', {
        method: 'PATCH',
        body: JSON.stringify({ reactions: ['Hives', 'Difficulty breathing'] }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'a1') });

      expect(response.status).toBe(200);
    });

    it('returns 500 on database error', async () => {
      (allergiesDb.updateAllergy as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/allergies/a1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update allergy');
    });
  });

  describe('DELETE', () => {
    it('deletes an allergy', async () => {
      (allergiesDb.deleteAllergy as jest.Mock).mockResolvedValue(mockAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies/a1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(allergiesDb.deleteAllergy).toHaveBeenCalledWith('a1');
    });

    it('returns 500 on database error', async () => {
      (allergiesDb.deleteAllergy as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/allergies/a1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1', 'a1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete allergy');
    });
  });
});
