# Plan: Novellia Pets MVP

## TL;DR
Build a fullstack TypeScript pet medical records app using **Next.js 16 + Turbopack**. PostgreSQL + Prisma for persistence. **You implement features; I scaffold the infrastructure.**

## Tech Stack
- **Framework**: Next.js 16 + Turbopack (App Router)
- **Frontend**: React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes (`src/app/api/`)
- **Database**: PostgreSQL + Prisma 7 (with pg adapter)
- **Validation**: Zod
- **Testing**: Jest (unit tests), Playwright (optional e2e)

## Project Structure
```
pets-mvp/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API routes
│   │   │   ├── pets/
│   │   │   │   ├── route.ts              # GET (list), POST (create)
│   │   │   │   └── [id]/
│   │   │   │       ├── route.ts          # GET, PUT, DELETE pet
│   │   │   │       ├── vaccines/route.ts # GET, POST vaccines
│   │   │   │       └── allergies/route.ts
│   │   │   ├── vaccines/[id]/route.ts    # PUT, DELETE vaccine
│   │   │   ├── allergies/[id]/route.ts   # PUT, DELETE allergy
│   │   │   ├── dashboard/route.ts        # GET stats
│   │   │   └── admin/record-types/route.ts
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Dashboard (/)
│   │   ├── pets/
│   │   │   ├── page.tsx        # Pet list (/pets)
│   │   │   ├── new/page.tsx    # Add pet (/pets/new)
│   │   │   └── [id]/
│   │   │       ├── page.tsx    # Pet detail (/pets/[id])
│   │   │       └── edit/page.tsx
│   │   └── admin/page.tsx      # Admin (/admin)
│   ├── components/             # Reusable UI components
│   ├── db/                     # Database query functions
│   │   ├── pets.ts
│   │   ├── vaccines.ts
│   │   ├── allergies.ts
│   │   └── dashboard.ts
│   ├── lib/                    # Utilities
│   │   ├── prisma.ts           # Prisma client singleton
│   │   └── validations.ts      # Zod schemas
│   └── generated/prisma/       # Prisma generated client
├── prisma/
│   └── schema.prisma
├── public/
│   └── uploads/                # Pet photos
├── package.json
├── next.config.ts
├── tsconfig.json
├── docker-compose.yml
└── Makefile
```

## Database Schema (Prisma)

```prisma
generator client {
  provider = "prisma-client"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

model Pet {
  id          String    @id @default(cuid())
  name        String
  animalType  String
  ownerName   String
  dateOfBirth DateTime
  photoUrl    String?
  vaccines    Vaccine[]
  allergies   Allergy[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Vaccine {
  id               String   @id @default(cuid())
  petId            String
  pet              Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
  name             String
  dateAdministered DateTime
  isRecurring      Boolean  @default(false)
  intervalMonths   Int?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model Allergy {
  id        String   @id @default(cuid())
  petId     String
  pet       Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
  name      String
  reactions String[]
  severity  String   // "mild" | "severe"
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model MedicalRecordType {
  id        String   @id @default(cuid())
  name      String   @unique
  fields    Json
  createdAt DateTime @default(now())
}
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/pets` | List pets (with ?search, ?animalType filters) |
| POST | `/api/pets` | Create pet |
| GET | `/api/pets/[id]` | Get pet with records |
| PUT | `/api/pets/[id]` | Update pet |
| DELETE | `/api/pets/[id]` | Delete pet (cascades) |
| GET | `/api/pets/[id]/vaccines` | List vaccines |
| POST | `/api/pets/[id]/vaccines` | Add vaccine |
| PUT | `/api/vaccines/[id]` | Update vaccine |
| DELETE | `/api/vaccines/[id]` | Delete vaccine |
| GET | `/api/pets/[id]/allergies` | List allergies |
| POST | `/api/pets/[id]/allergies` | Add allergy |
| PUT | `/api/allergies/[id]` | Update allergy |
| DELETE | `/api/allergies/[id]` | Delete allergy |
| GET | `/api/dashboard` | Stats (total pets, by type, due vaccines) |
| GET | `/api/admin/record-types` | List record types |
| POST | `/api/admin/record-types` | Create record type |

## Pages

1. **Dashboard** (`/`) - Stats cards, due soon vaccines, recent activity
2. **Pet List** (`/pets`) - Search bar, animal type filter, pet cards
3. **Pet Detail** (`/pets/[id]`) - Profile, photo, medical records tabs
4. **Add Pet** (`/pets/new`) - Form with photo upload
5. **Edit Pet** (`/pets/[id]/edit`) - Prefilled form
6. **Admin** (`/admin`) - Manage medical record types

## Implementation Phases

### Phase 1: Infrastructure (Copilot scaffolds)
- [x] package.json with deps (next, prisma, tailwind, zod, etc.)
- [x] next.config.ts, tsconfig.json, postcss.config.mjs
- [x] prisma/schema.prisma
- [x] src/lib/prisma.ts (singleton pattern from wedding-website)
- [x] docker-compose.yml for PostgreSQL
- [x] Makefile (setup, dev, db-migrate)
- [x] Basic layout.tsx with nav

**Deliverable**: `make setup && make dev` works with health check

### Phase 2: Backend Core (You implement)
1. Run initial migration
2. Create src/db/pets.ts query functions
3. Create src/db/vaccines.ts query functions
4. Create src/db/allergies.ts query functions
5. Implement all API routes
6. Add Zod validation schemas in src/lib/validations.ts

**Verification**: All endpoints work via curl

### Phase 3: Frontend Core (You implement)
1. Pet List page with search/filter
2. Pet Detail page with medical records
3. Add/Edit Pet forms with validation
4. Add/Edit Medical Record modals
5. Delete confirmation dialogs
6. Loading and error states

### Phase 4: Dashboard & Features (You implement)
1. Dashboard stats API
2. Dashboard UI with stat cards
3. Vaccine reminders (due soon section)
4. Pet photo upload

### Phase 5: Admin & Testing (You implement)
1. Admin page for record types
2. Jest unit tests for db/ functions
3. (Optional) Playwright e2e tests

## Files to Create

**Infrastructure (Copilot):**
- `package.json`
- `next.config.ts`
- `tsconfig.json`
- `postcss.config.mjs`
- `tailwind.config.ts` (if needed for v4)
- `prisma/schema.prisma`
- `src/lib/prisma.ts`
- `src/app/layout.tsx`
- `src/app/globals.css`
- `docker-compose.yml`
- `Makefile`
- `.env.example`
- `.gitignore`

**Implementation (You):**
- `src/db/*.ts` - Query functions
- `src/lib/validations.ts` - Zod schemas
- `src/app/api/**/*.ts` - API routes
- `src/app/**/page.tsx` - Pages
- `src/components/*.tsx` - UI components

## Verification Checklist
- [ ] `make setup` installs deps and runs migrations
- [ ] `make dev` starts app on port 3000
- [ ] All CRUD endpoints return proper responses
- [ ] Pet list shows search and filter
- [ ] Pet detail shows medical records
- [ ] Forms validate input with Zod
- [ ] Delete shows confirmation dialog
- [ ] Dashboard shows accurate stats
- [ ] Vaccine reminders show due soon
- [ ] Pet photos upload and display

## Cool Features
1. **Vaccine Reminders** - `isRecurring` + `intervalMonths` fields, dashboard shows due soon
2. **Pet Profile Photos** - Upload to `/public/uploads/`, display on pet detail

## Authentication Notes (for discussion)
Would add: User model, JWT tokens (or NextAuth), protected API routes middleware, React context for auth state.

## Reference
Based on wedding-website architecture: Next.js 16 + Turbopack, App Router, src/db/ for query functions, Prisma pg adapter pattern.
