# Potential Improvements

## 1. Client-Side or Server-Side Caching for Pets List

- Add caching for faster retrieval of pets list

## 2. Input Validation Improvements

- Add Zod schemas for client side input validation (currently manual checks)
- Add date validation (e.g., dateOfBirth can't be in the future)

Zod client-side example: 
```
import { createPetSchema } from "@/lib/validations";

const validatePetForm = () => {
  const result = createPetSchema.safeParse(newPet);
  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    setFormErrors(errors);
    return false;
  }
  return true;
};
```

## 4. Error Handling

- Standardize API error response format

## 5. Testing Gaps

- Add integration tests for the UI pages
- Add E2E tests with Playwright for critical flows (add pet, add vaccine)

## 6. Logging

- Add a logger class with a unique uuid generated per request and passed from the frontend to the backend
- Each log message should be using this class
- Ship logs to Dynatrace or Cloudwatch (or both)