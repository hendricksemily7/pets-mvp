import { POST } from './route';
import * as allergiesDb from '@/db/allergies';

// Mock the database functions
jest.mock('@/db/allergies');

// Helper to create params promise (Next.js 15 style)
const createParams = (id: string) => Promise.resolve({ id });

describe('/api/pets/[id]/allergies', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const validAllergyData = {
      name: 'Peanuts',
      reactions: ['Itching', 'Swelling'],
      severity: 'severe',
    };

    it('creates a new allergy with valid data', async () => {
      const createdAllergy = {
        id: 'a1',
        petId: '1',
        ...validAllergyData,
      };
      (allergiesDb.createAllergy as jest.Mock).mockResolvedValue(createdAllergy);

      const request = new Request('http://localhost/api/pets/1/allergies', {
        method: 'POST',
        body: JSON.stringify(validAllergyData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.allergy.name).toBe('Peanuts');
      expect(data.allergy.severity).toBe('severe');
      expect(allergiesDb.createAllergy).toHaveBeenCalledTimes(1);
    });

    it('creates a mild allergy', async () => {
      const mildAllergy = {
        name: 'Dust',
        reactions: ['Sneezing'],
        severity: 'mild',
      };
      (allergiesDb.createAllergy as jest.Mock).mockResolvedValue({
        id: 'a2',
        petId: '1',
        ...mildAllergy,
      });

      const request = new Request('http://localhost/api/pets/1/allergies', {
        method: 'POST',
        body: JSON.stringify(mildAllergy),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });

      expect(response.status).toBe(201);
    });

    it('creates allergy with empty reactions array', async () => {
      const allergyNoReactions = {
        name: 'Unknown',
        reactions: [],
        severity: 'mild',
      };
      (allergiesDb.createAllergy as jest.Mock).mockResolvedValue({
        id: 'a3',
        petId: '1',
        ...allergyNoReactions,
      });

      const request = new Request('http://localhost/api/pets/1/allergies', {
        method: 'POST',
        body: JSON.stringify(allergyNoReactions),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });

      expect(response.status).toBe(201);
    });

    it('returns 500 for invalid severity value', async () => {
      const invalidData = {
        name: 'Peanuts',
        reactions: [],
        severity: 'extreme', // invalid - must be 'mild' or 'severe'
      };

      const request = new Request('http://localhost/api/pets/1/allergies', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });

      expect(response.status).toBe(500);
      expect(allergiesDb.createAllergy).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
      (allergiesDb.createAllergy as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/allergies', {
        method: 'POST',
        body: JSON.stringify(validAllergyData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create allergy');
    });
  });
});
