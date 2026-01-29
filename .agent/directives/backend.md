---
alwaysApply: true
---

# TalentHive Backend Patterns

> **REGOLA D'ORO**: L'agente NON può modificare questo file. Solo l'utente può farlo.

## Quick Reference Paths

- **Routes**: `backend/src/routes/{entity}.routes.ts`
- **Services**: `backend/src/services/{entity}.service.ts`
- **Middlewares**: `backend/src/middlewares/`
- **Types**: `backend/src/types/` (backend-only) + `@shared/types` (shared)
- **Utils**: `backend/src/utils/`

---

## Architecture

```
backend/src/
├── routes/              # Express route handlers
├── services/            # Business logic (class-based)
├── middlewares/         # Auth, RBAC, validation
├── types/               # Backend-only types
├── utils/               # Helpers
├── libs/                # External libs (prisma)
└── config/              # Configuration
```

---

## Service Pattern (Class-Based)

```typescript
// services/{entity}.service.ts
import { prisma } from "../libs/prisma";
import type { Entity, Prisma } from "@prisma/client";
import type { UserWithoutPassword, CreateEntityDto } from "@shared/types";

class EntityService {
  /**
   * Get entities list
   * RBAC: CANDIDATE sees X, RECRUITER sees Y, ADMIN sees all
   */
  async getEntities(
    query: ListEntitiesDto,
    user: UserWithoutPassword
  ): Promise<PaginatedResponse<Entity>> {
    // 1. Sanitize query
    let safeQuery = sanitizePrismaQuery(query, { maxIncludeDepth: 1 });

    // 2. RBAC: Override where based on role
    if (user.role === "CANDIDATE") {
      safeQuery.where = { ...safeQuery.where, userId: user.id };
    } else if (user.role === "RECRUITER") {
      // Recruiter-specific logic
    }
    // ADMIN: No restrictions

    // 3. Execute query
    const [data, count] = await Promise.all([
      prisma.entity.findMany(safeQuery),
      prisma.entity.count({ where: safeQuery.where }),
    ]);

    return { data, count, query: safeQuery };
  }

  /**
   * Get entity by ID
   */
  async getEntityById(id: string, user: UserWithoutPassword): Promise<Entity> {
    const entity = await prisma.entity.findUnique({
      where: { id },
      include: { ... },
    });

    if (!entity) {
      throw new NotFoundError("Entity not found");
    }

    // RBAC check
    if (user.role === "CANDIDATE" && entity.userId !== user.id) {
      throw new NotFoundError("Entity not found");
    }

    return entity;
  }
}

export const entityService = new EntityService();
```

---

## Routes Pattern

```typescript
// routes/{entity}.routes.ts
import { Router } from "express";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { entityService } from "../services/entity.service";

const router = Router();

// List with Prisma query
router.post("/list", authenticate, async (req, res, next) => {
  try {
    const result = await entityService.getEntities(req.body, req.user!);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get by ID
router.get("/:id", authenticate, async (req, res, next) => {
  try {
    const entity = await entityService.getEntityById(req.params.id, req.user!);
    res.json(entity);
  } catch (error) {
    next(error);
  }
});

// Create (role-restricted)
router.post(
  "/",
  authenticate,
  authorize(["ADMIN", "RECRUITER"]),
  async (req, res, next) => {
    try {
      const entity = await entityService.createEntity(req.body, req.user!);
      res.status(201).json(entity);
    } catch (error) {
      next(error);
    }
  },
);

export default router;
```

---

## RBAC Pattern

### Roles

- **ADMIN**: Full access, bypasses ownership checks
- **RECRUITER**: Owns jobs, manages applications for own jobs
- **CANDIDATE**: Sees only own applications, published jobs

### Enforcement Location

**SEMPRE nel Service**, mai nelle routes:

```typescript
// ✅ Correct: RBAC in service
async getEntity(id: string, user: UserWithoutPassword) {
  const entity = await prisma.entity.findUnique({ where: { id } });

  // RBAC check
  if (user.role === "CANDIDATE" && entity.userId !== user.id) {
    throw new NotFoundError("Not found");
  }

  return entity;
}

// ❌ Wrong: RBAC in route
router.get("/:id", authenticate, (req, res) => {
  // Don't do RBAC here
});
```

---

## Prisma Query Utils

```typescript
import { sanitizePrismaQuery } from "../utils/sanitize-prisma-query.util";
import {
  removeRestrictedFields,
  setQueryDefaults,
} from "../utils/prisma-query.utils";

// Sanitize incoming query
const safeQuery = sanitizePrismaQuery(incomingQuery, {
  maxIncludeDepth: 1,
  maxTake: 100,
});

// Remove sensitive fields for CANDIDATE
const candidateSafeWhere = removeRestrictedFields(where, [
  "workflowStatus",
  "score",
  "notes",
]);

// Set defaults
safeQuery = setQueryDefaults(safeQuery, {
  skip: 0,
  take: 10,
  orderBy: { createdAt: "desc" },
});
```

---

## File Upload Pattern

```typescript
// With Multer + MinIO
import { storageService } from "./storage.service";

async createWithFile(
  data: CreateDto,
  fileBuffer: Buffer,
  fileName: string,
  userId: string
): Promise<Entity> {
  // Upload to MinIO
  const fileUrl = await storageService.uploadFile(
    fileBuffer,
    `entities/${userId}/${fileName}`,
    "application/pdf"
  );

  // Create entity with file reference
  return prisma.entity.create({
    data: {
      ...data,
      userId,
      fileUrl,
    },
  });
}
```

---

## Error Handling

### Pattern

1. **Custom Errors**: Use classes from `backend/src/errors/app.error.ts`.
2. **Services**: Throw specific errors (`ValidationError`, `NotFoundError`, etc.).
3. **Routes**: Use `try/catch` and pass errors to `next(error)` (or rely on `express-async-errors`).
4. **Middleware**: Global `errorHandler` formats response.

### Service Example

```typescript
import { NotFoundError, ForbiddenError } from "../errors/app.error";

async getEntity(id: string, user: UserWithoutPassword) {
  const entity = await prisma.entity.findUnique({ where: { id } });

  if (!entity) {
    throw new NotFoundError("Entity not found");
  }

  // RBAC check
  if (user.role === "CANDIDATE" && entity.userId !== user.id) {
    throw new ForbiddenError("Access denied");
  }

  return entity;
}
```

### Route Example

```typescript
import { Router, NextFunction, Request, Response } from "express";

router.get(
  "/:id",
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await entityService.getEntity(req.params.id, req.user!);
      res.json(result);
    } catch (error) {
      next(error); // Pass to global error handler
    }
  },
);
```
