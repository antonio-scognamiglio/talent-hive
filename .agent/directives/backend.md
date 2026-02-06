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

## Error Messages (Security Critical)

### Regola Generale: Information Hiding

**SEMPRE usare messaggi di errore generici per prevenire information disclosure.**

#### Forbidden/Authorization Errors

❌ **MAI rivelare dettagli su ruoli e permessi**:

```typescript
// SBAGLIATO
throw new ForbiddenError("Only admins can access this");
throw new ForbiddenError("You need RECRUITER role");
throw new ForbiddenError("This endpoint is for recruiters and admins");
```

✅ **Usare messaggi generici**:

```typescript
// CORRETTO
throw new ForbiddenError("Access denied");
throw new ForbiddenError("Not authorized");
```

#### NotFound Errors

✅ **Per ownership checks, usare NotFoundError invece di ForbiddenError**:

```typescript
// CORRETTO: Non rivelare se la risorsa esiste
if (user.role === "CANDIDATE" && entity.userId !== user.id) {
  throw new NotFoundError("Entity not found"); // Non dire "you don't own this"
}
```

#### Validation Errors

✅ **I validation errors possono essere più specifici (ma senza rivelare logica interna)**:

```typescript
// CORRETTO
throw new ValidationError("Job ID is required");
throw new ValidationError("Invalid email format");

// SBAGLIATO
throw new ValidationError(
  "You can only apply if job status is PUBLISHED and you're a CANDIDATE",
);
```

**Rationale**: Messaggi verbosi rivelano la struttura dell'autorizzazione, aiutando attaccanti a capire come bypassare i controlli.

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

### Defense-in-Depth (Critical)

**REGOLA**: Mai dare per scontato che i controlli a livello route siano sufficienti. Implementare SEMPRE controlli espliciti nei service methods.

**Razionale**: Un utente curioso potrebbe:

- Modificare il frontend e chiamare endpoint non autorizzati
- Bypassare middleware se ci sono bug nella route definition
- Usare tool come Postman/curl per chiamare API direttamente

**Pattern Corretto**:

```typescript
// ✅ Service: Doppio controllo con messaggi generici
async getStats(filters: {}, user: UserWithoutPassword) {
  // 1. Defense-in-depth: Block unauthorized roles explicitly
  // ⚠️ Use generic error message to prevent information disclosure
  if (user.role === "CANDIDATE") {
    throw new ForbiddenError("Access denied");
  }

  // 2. Continue with business logic
  if (user.role === "RECRUITER") {
    // Filter data by ownership
    if (!ownsResource) {
      throw new ForbiddenError("Access denied"); // Generic, don't reveal details
    }
  }
  // ...
}

// Route: Primo livello di controllo
router.get("/stats", authenticate, async (req, res, next) => {
  try {
    if (req.user!.role === "CANDIDATE") {
      throw new ForbiddenError("Access denied"); // Generic message
    }
    const stats = await service.getStats({}, req.user!);
    res.json(stats);
  } catch (error) {
    next(error);
  }
});
```

**Principio Aggiuntivo: Information Hiding**

- ❌ MAI rivelare dettagli sull'autorizzazione ("Only admins can...", "You need RECRUITER role...")
- ✅ Usare sempre messaggi generici ("Access denied", "Not authorized")
- **Rationale**: Prevenire information disclosure su ruoli e permessi dell'applicazione

Questo garantisce sicurezza anche se:

- La route viene modificata per errore
- Il service viene chiamato da altri contesti
- Ci sono bug nei middleware

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
