import { GET, PATCH, DELETE } from './route';
import * as petsDb from '@/db/pets';

// Mock the database functions
jest.mock('@/db/pets');

const mockPet = {
  id: '1',
  name: 'Buddy',
  animalType: 'Dog',
  dateOfBirth: new Date('2020-01-15'),
  ownerName: 'John Doe',
  photoUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  vaccines: [
    {
      id: 'v1',
      name: 'Rabies',
      dateAdministered: new Date('2023-01-01'),
      isRecurring: true,
      intervalMonths: 12,
    },
  ],
  allergies: [
    {
      id: 'a1',
      name: 'Peanuts',
      reactions: ['Itching', 'Swelling'],
      severity: 'mild',
    },
  ],
};

// Helper to create params promise (Next.js 15 style)
const createParams = (id: string) => Promise.resolve({ id });

describe('/api/pets/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns a pet by id', async () => {
      (petsDb.getPetById as jest.Mock).mockResolvedValue(mockPet);

      const request = new Request('http://localhost/api/pets/1');
      const response = await GET(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pet.name).toBe('Buddy');
      expect(data.pet.vaccines).toHaveLength(1);
      expect(data.pet.allergies).toHaveLength(1);
      expect(petsDb.getPetById).toHaveBeenCalledWith('1');
    });

    it('returns 404 when pet not found', async () => {
      (petsDb.getPetById as jest.Mock).mockResolvedValue(null);

      const request = new Request('http://localhost/api/pets/999');
      const response = await GET(request, { params: createParams('999') });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Pet not found');
    });

    it('returns 500 on database error', async () => {
      (petsDb.getPetById as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1');
      const response = await GET(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch pet');
    });
  });

  describe('PATCH', () => {
    it('updates a pet with valid data', async () => {
      const updatedPet = { ...mockPet, name: 'Buddy Jr.' };
      (petsDb.updatePet as jest.Mock).mockResolvedValue(updatedPet);

      const request = new Request('http://localhost/api/pets/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Buddy Jr.' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pet.name).toBe('Buddy Jr.');
      expect(petsDb.updatePet).toHaveBeenCalledWith('1', { name: 'Buddy Jr.' });
    });

    it('allows partial updates', async () => {
      const updatedPet = { ...mockPet, ownerName: 'Jane Doe' };
      (petsDb.updatePet as jest.Mock).mockResolvedValue(updatedPet);

      const request = new Request('http://localhost/api/pets/1', {
        method: 'PATCH',
        body: JSON.stringify({ ownerName: 'Jane Doe' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1') });

      expect(response.status).toBe(200);
      expect(petsDb.updatePet).toHaveBeenCalledWith('1', { ownerName: 'Jane Doe' });
    });

    it('returns 500 on database error', async () => {
      (petsDb.updatePet as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Buddy Jr.' }),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await PATCH(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to update pet');
    });
  });

  describe('DELETE', () => {
    it('deletes a pet', async () => {
      (petsDb.deletePet as jest.Mock).mockResolvedValue(mockPet);

      const request = new Request('http://localhost/api/pets/1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(petsDb.deletePet).toHaveBeenCalledWith('1');
    });

    it('returns 500 on database error', async () => {
      (petsDb.deletePet as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets/1', { method: 'DELETE' });
      const response = await DELETE(request, { params: createParams('1') });
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to delete pet');
    });
  });
});
