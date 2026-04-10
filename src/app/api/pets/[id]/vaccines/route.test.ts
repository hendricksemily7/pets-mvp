import { POST } from './route';
import * as vaccinesDb from '@/db/vaccines';

// Mock the database functions
jest.mock('@/db/vaccines');

// Helper to create params promise (Next.js 15 style)
const createParams = (id: string) => Promise.resolve({ id });

describe('/api/pets/[id]/vaccines', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    const validVaccineData = {
      name: 'Rabies',
      dateAdministered: '2024-01-15',
      isRecurring: true,
      intervalMonths: 12,
    };

    it('creates a new vaccine with valid data', async () => {
      const createdVaccine = {
        id: 'v1',
        petId: '1',
        ...validVaccineData,
        dateAdministered: new Date(validVaccineData.dateAdministered),
      };
      (vaccinesDb.createVaccine as jest.Mock).mockResolvedValue(createdVaccine);

      const request = new Request('http://localhost/api/pets/1/vaccines', {
        method: 'POST',
        body: JSON.stringify(validVaccineData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.vaccine.name).toBe('Rabies');
      expect(vaccinesDb.createVaccine).toHaveBeenCalledTimes(1);
    });

    it('creates a non-recurring vaccine', async () => {
      const nonRecurringVaccine = {
        name: 'Microchip',
        dateAdministered: '2024-02-01',
        isRecurring: false,
      };
      (vaccinesDb.createVaccine as jest.Mock).mockResolvedValue({
        id: 'v2',
        petId: '1',
        ...nonRecurringVaccine,
      });

      const request = new Request('http://localhost/api/pets/1/vaccines', {
        method: 'POST',
        body: JSON.stringify(nonRecurringVaccine),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });

      expect(response.status).toBe(201);
    });

    it('returns 500 for invalid data', async () => {
      const invalidData = { name: '' }; // empty name not allowed

      const request = new Request('http://localhost/api/pets/1/vaccines', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });

      expect(response.status).toBe(500);
      expect(vaccinesDb.createVaccine).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
      (vaccinesDb.createVaccine as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/vaccines', {
        method: 'POST',
        body: JSON.stringify(validVaccineData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create vaccine');
    });
  });
});
