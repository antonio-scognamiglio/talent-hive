---
alwaysApply: true
---

# TalentHive Monorepo Patterns

> **REGOLA D'ORO**: L'agente NON può modificare questo file. Solo l'utente può farlo.

## Project Structure

```
talent-hive/
├── backend/           # Express + Prisma API
├── frontend/          # React + Vite app
├── shared/            # Shared TypeScript types
└── docker-compose.yml # PostgreSQL + MinIO
```

---

## Type System

### Generation Flow

```
Prisma Schema (backend/prisma/schema.prisma)
       ↓
   [bunx prisma generate]
       ↓
shared/types/entities/generated/interfaces.ts  ← Auto-generated
       ↓
Backend: import from @prisma/client (runtime + types)
Frontend: import from @shared/types (types only)
```

### Import Paths

**Frontend** - Uses path alias `@shared`:

```tsx
import type { Job, Application, User } from "@shared/types";
import type { CreateJobDto, UpdateJobDto } from "@shared/types";
```

**Backend** - Uses both:

```typescript
// Runtime (Prisma client)
import { prisma } from "../libs/prisma";
import type { Application, WorkflowStatus, Prisma } from "@prisma/client";

// Shared DTOs
import type { CreateApplicationDto, ListApplicationsDto } from "@shared/types";
```

---

## Shared Types Location

### Generated (NEVER modify)

- `shared/types/entities/generated/interfaces.ts` - Prisma models as TS interfaces

### Manually Defined

- `shared/types/dto/` - Request DTOs (`LoginDto`, `CreateJobDto`, etc.)
- `shared/types/responses/` - Response types (`AuthResponse`)
- `shared/types/entities/` - Derived types (`UserWithoutPassword`, `UserProfile`)

### Backend-Only

- `backend/src/types/pagination.types.ts` - `PaginatedResponse<T>`

### Frontend-Only

- `frontend/src/types/` - Generic frontend types
- `frontend/src/features/{feature}/types/` - UI-only types per feature

---

## Type Generation Commands

```bash
cd backend

# Generate Prisma types (→ shared/types/)
bunx prisma generate

# After schema changes:
bunx prisma migrate dev --name migration_name

# Push without migration (dev only)
bun run db:push
```

---

## Adding New Types

### New DTO (API Contract)

1. Create in `shared/types/dto/{entity}.dto.ts`
2. Export from `shared/types/dto/index.ts`
3. Import in both FE and BE via `@shared/types`

### New Entity Field (Prisma)

1. Update `backend/prisma/schema.prisma`
2. Run `bunx prisma generate`
3. Types auto-update in `shared/types/entities/generated/`
4. Both FE and BE see new field immediately

### UI-Only Type

1. Create in `frontend/src/features/{feature}/types/`
2. Only for presentation logic (e.g., `isDragging`, `isExpanded`)

---

## Best Practices

✅ **DO**:

- Import types from `@shared/types` in frontend
- Import runtime from `@prisma/client` in backend
- Keep DTOs simple, avoid nested Prisma types
- Run `bunx prisma generate` after schema changes

❌ **DON'T**:

- Import from `@prisma/client` in frontend (no runtime)
- Duplicate types between FE and BE
- Modify generated files
