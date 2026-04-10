import { GET, POST } from './route';
import * as petsDb from '@/db/pets';

// Mock the database functions
jest.mock('@/db/pets');

const mockPets = [
  {
    id: '1',
    name: 'Buddy',
    animalType: 'Dog',
    dateOfBirth: new Date('2020-01-15'),
    ownerName: 'John Doe',
    photoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    vaccines: [],
    allergies: [],
  },
  {
    id: '2',
    name: 'Whiskers',
    animalType: 'Cat',
    dateOfBirth: new Date('2021-06-20'),
    ownerName: 'Jane Smith',
    photoUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    vaccines: [],
    allergies: [],
  },
];

describe('/api/pets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns all pets', async () => {
      (petsDb.getAllPets as jest.Mock).mockResolvedValue(mockPets);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pets).toHaveLength(2);
      expect(data.pets[0].name).toBe('Buddy');
      expect(petsDb.getAllPets).toHaveBeenCalledTimes(1);
    });

    it('returns empty array when no pets exist', async () => {
      (petsDb.getAllPets as jest.Mock).mockResolvedValue([]);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.pets).toHaveLength(0);
    });

    it('returns 500 on database error', async () => {
      (petsDb.getAllPets as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to fetch pets');
    });
  });

  describe('POST', () => {
    const validPetData = {
      name: 'Max',
      animalType: 'Dog',
      dateOfBirth: '2022-03-10',
      ownerName: 'Alice Johnson',
    };

    it('creates a new pet with valid data', async () => {
      const createdPet = { id: '3', ...validPetData, dateOfBirth: new Date(validPetData.dateOfBirth) };
      (petsDb.createPet as jest.Mock).mockResolvedValue(createdPet);

      const request = new Request('http://localhost/api/pets', {
        method: 'POST',
        body: JSON.stringify(validPetData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(petsDb.createPet).toHaveBeenCalledTimes(1);
    });

    it('creates a pet with optional photoUrl', async () => {
      const petDataWithPhoto = {
        ...validPetData,
        photoUrl: 'https://example.com/photo.jpg',
      };
      (petsDb.createPet as jest.Mock).mockResolvedValue({ id: '4', ...petDataWithPhoto });

      const request = new Request('http://localhost/api/pets', {
        method: 'POST',
        body: JSON.stringify(petDataWithPhoto),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
    });

    it('returns 500 for invalid data (missing required fields)', async () => {
      const invalidData = { name: 'Max' }; // missing required fields

      const request = new Request('http://localhost/api/pets', {
        method: 'POST',
        body: JSON.stringify(invalidData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);

      expect(response.status).toBe(500);
      expect(petsDb.createPet).not.toHaveBeenCalled();
    });

    it('returns 500 on database error', async () => {
      (petsDb.createPet as jest.Mock).mockRejectedValue(new Error('DB error'));

      const request = new Request('http://localhost/api/pets', {
        method: 'POST',
        body: JSON.stringify(validPetData),
        headers: { 'Content-Type': 'application/json' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create pet');
    });
  });
});
