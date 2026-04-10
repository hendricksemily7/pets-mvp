import { GET, PATCH, DELETE } from './route';
import * as vaccinesDb from '@/db/vaccines';

// Mock the database functions
jest.mock('@/db/vaccines');

const mockVaccine = {
  id: 'v1',
  petId: '1',
  name: 'Rabies',
  dateAdministered: new Date('2024-01-15'),
  isRecurring: true,
  intervalMonths: 12,
  documentUrl: null,
};

// Helper to create params promise (Next.js 15 style)
const createParams = (id: string, vaccineId: string) => Promise.resolve({ id, vaccineId });

describe('/api/pets/[id]/vaccines/[vaccineId]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns a vaccine by id', async () => {
      (vaccinesDb.getVaccineById as jest.Mock).mockResolvedValue(mockVaccine);

      const request = new Request('http://localhost/api/pets/1/vaccines/v1');
      const response = await GET(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.vaccine.name).toBe('Rabies');
      expect(vaccinesDb.getVaccineById).toHaveBeenCalledWith('v1');
    });

    it('returns 404 when vaccine not found', async () => {
      (vaccinesDb.getVaccineById as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/pets/1/vaccines/v999');
      const response = await GET(request, { params: createParams('1', 'v999') });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Vaccine not found');
    });

    it('returns 500 on database error', async () => {
      (vaccinesDb.getVaccineById as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/vaccines/v1');
      const response = await GET(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch vaccine');
    });
  });

  describe('PATCH', () => {
    it('updates a vaccine', async () => {
      const updatedVaccine = { ...mockVaccine, name: 'Rabies (Updated)' };
      (vaccinesDb.updateVaccine as jest.Mock).mockResolvedValue(updatedVaccine);

      const request = new Request('http://localhost/api/pets/1/vaccines/v1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Rabies (Updated)' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.vaccine.name).toBe('Rabies (Updated)');
      expect(vaccinesDb.updateVaccine).toHaveBeenCalledWith('v1', { name: 'Rabies (Updated)' });
    });

    it('updates intervalMonths', async () => {
      const updatedVaccine = { ...mockVaccine, intervalMonths: 6 };
      (vaccinesDb.updateVaccine as jest.Mock).mockResolvedValue(updatedVaccine);

      const request = new Request('http://localhost/api/pets/1/vaccines/v1', {
        method: 'PATCH',
        body: JSON.stringify({ intervalMonths: 6 }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'v1') });

      expect(response.status).toBe(200);
      expect(vaccinesDb.updateVaccine).toHaveBeenCalledWith('v1', { intervalMonths: 6 });
    });

    it('returns 500 on database error', async () => {
      (vaccinesDb.updateVaccine as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/vaccines/v1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update vaccine');
    });
  });

  describe('DELETE', () => {
    it('deletes a vaccine', async () => {
      (vaccinesDb.deleteVaccine as jest.Mock).mockResolvedValue(mockVaccine);

      const request = new Request('http://localhost/api/pets/1/vaccines/v1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(vaccinesDb.deleteVaccine).toHaveBeenCalledWith('v1');
    });

    it('returns 500 on database error', async () => {
      (vaccinesDb.deleteVaccine as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1/vaccines/v1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1', 'v1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete vaccine');
    });
  });
});
