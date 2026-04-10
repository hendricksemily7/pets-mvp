# Novellia Pets MVP

Pet medical records management system built with Next.js, React, PostgreSQL, and Prisma.

## Quick Start (Reviewer)

**Prerequisites:** Docker installed

```bash
# 1. Setup (install deps, start DB, run migrations)
npm run setup

# 2. Start dev server
npm run dev
```

App runs at http://localhost:3000

## Manual Setup

If `npm run setup` doesn't work, run these commands individually:

```bash
# Install dependencies
npm install

# Start PostgreSQL container
docker-compose up -d

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Start development server
npm run dev
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with Turbopack |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run setup` | One-time project setup |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:reset` | Reset database (drops all data) |
| `npm run prisma:studio` | Open Prisma Studio GUI |
| `npm run prisma:migrate` | Create new migration |
| `npm test` | Run tests |

## Prisma Studio

Prisma Studio is a GUI for viewing and editing your database data. To open it:

```bash
npx prisma studio
```

This opens a browser at http://localhost:5555 where you can:
- Browse all tables (Pet, Vaccine, Allergy, MedicalRecordType)
- Add, edit, and delete records
- View relationships between tables

## Tech Stack

- **Frontend:** React 19, Next.js 16 (Turbopack), Tailwind CSS 4
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL + Prisma 7
- **Validation:** Zod
- **Testing:** Jest

## Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/             # API routes
│   ├── pets/            # Pet pages
│   └── admin/           # Admin pages
├── components/          # Reusable UI components
├── db/                  # Database query functions
├── lib/                 # Utilities (prisma client, validations)
└── generated/prisma/    # Prisma generated client
```

## Environment Variables

Copy `.env.example` to `.env`. Default values work with Docker setup:

```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/novellia_pets"
```

## Tools & Libraries Used

- Next.js: Full-stack React framework - what I'm most familiar with for this type of usecase
- Prisma: Type-safe ORM for database access and migrations - what I'm most familiar with
- Tailwind CSS: Utility-first CSS for fast, consistent styling - what I'm most familiar with using recently
- Jest: Testing framework for unit/integration tests - what I'm most familiar with
- Zod: Schema validation for server-side validation - first time using it, seems most relevant for the usecase
- Custom Toast: For user feedback (success/error) in a modern, non-blocking way - Also something I've used before for a company
- AI Usage with GitHub Copilot and Opus 4.6: Used for code suggestions, boilerplate, implementing much of the UI and unit tests - all code reviewed and understood