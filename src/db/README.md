# Data access layer

```
API Route (src/app/api/pets/route.ts)
    ↓ calls
Data Access Layer (src/db/pets.ts)
    ↓ calls
Prisma ORM (src/lib/prisma.ts)
    ↓ talks to
PostgreSQL database
```


Why this pattern?

1. Reusability — Same query functions work in API routes, server components, scripts
2. Testability — Easy to mock src/db/pets.ts in tests
3. Clean routes — API routes stay thin, just handle HTTP concerns