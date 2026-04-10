import { z } from 'zod';

/**
 * Using Zod for Validation Schemas - https://zod.dev/api
 * 
 * This file defines Zod schemas for input validation and TypeScript types.
 * 
 * Usage:
 * - API routes: Use schema.parse(json) for runtime validation (returns 400 on invalid input)
 * - DB layer: Use TypeScript types (e.g., CreatePetInput) for compile-time type safety only
 * 
 * Example (API route):
 *   const data = createPetSchema.parse(await request.json()); // throws ZodError if invalid
 *   const pet = await createPet(data); // data is typed as CreatePetInput
 * 
 * Example (DB layer):
 *   export async function createPet(data: CreatePetInput) { ... } // type only, no runtime validation
 */

// ============ Pet Schemas ============
export const createPetSchema = z.object({
  name: z.string().min(1),
  animalType: z.string().min(1),
  dateOfBirth: z.coerce.date(),
  ownerName: z.string().min(1),
  photoUrl: z.string().min(1).optional(),
});

export const updatePetSchema = createPetSchema.partial();

export type CreatePetInput = z.infer<typeof createPetSchema>;
export type UpdatePetInput = z.infer<typeof updatePetSchema>;

// ============ Allergy Schemas ============
export const createAllergySchema = z.object({
  name: z.string().min(1),
  reactions: z.array(z.string()).default([]),
  severity: z.enum(['mild', 'severe']),
  documentUrl: z.string().optional(),
});

export const updateAllergySchema = createAllergySchema.partial();

export type CreateAllergyInput = z.infer<typeof createAllergySchema>;
export type UpdateAllergyInput = z.infer<typeof updateAllergySchema>;

// ============ Vaccine Schemas ============
export const createVaccineSchema = z.object({
  name: z.string().min(1),
  dateAdministered: z.coerce.date(),
  isRecurring: z.boolean().default(false),
  intervalMonths: z.number().int().positive().optional(),
  documentUrl: z.string().optional(),
});

export const updateVaccineSchema = createVaccineSchema.partial();

export type CreateVaccineInput = z.infer<typeof createVaccineSchema>;
export type UpdateVaccineInput = z.infer<typeof updateVaccineSchema>;