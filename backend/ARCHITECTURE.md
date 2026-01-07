# Backend Architecture Pattern - TalentHive

**Status**: MVP (2-Layer) → Future: Professional (3-Layer with Repository Pattern)

---

## 🚨 Scelta Architetturale MVP

Per questo MVP di 7 giorni stiamo usando un'**architettura semplificata (2-Layer)**:

```
Controller → Service → Prisma (diretto)
```

**Perché questa "scorciatoia"?**

- ⏱️ Più veloce da implementare (~30% meno codice)
- ✅ Adatta per progetti piccoli/medi
- ✅ Usata anche in powergiob-concorsi (progetto di riferimento)

**Limitazioni**:

- ❌ Service dipende direttamente da Prisma (accoppiamento stretto)
- ❌ Difficile testare i Service (servono mock di Prisma)
- ❌ Cambio ORM richiede modifica di tutti i Service

---

## 🏆 Architettura Professionale (3-Layer con Repository Pattern)

### Struttura Ideale

```
┌─────────────┐
│ Controller  │  ← Gestisce HTTP (Request/Response)
└──────┬──────┘
       │
┌──────▼──────┐
│  Service    │  ← Business Logic pura
└──────┬──────┘
       │
┌──────▼──────┐
│ Repository  │  ← Data Access Layer (query DB)
└──────┬──────┘
       │
┌──────▼──────┐
│  Prisma/DB  │
└─────────────┘
```

### Responsabilità di ogni Layer

#### 1. Controller (HTTP Layer)

**Cosa fa**:

- Riceve richieste HTTP
- Valida input (DTO con zod/class-validator)
- Chiama il Service
- Restituisce risposta HTTP

**Esempio**:

```typescript
// controllers/auth.controller.ts
@Post('/login')
async login(@Body() dto: LoginDto) {
  const result = await authService.login(dto);
  this.setHeader('Set-Cookie', result.cookie);
  return { user: result.user };
}
```

#### 2. Service (Business Logic Layer)

**Cosa fa**:

- Implementa logica di business
- Coordina operazioni (es: login = verifica password + genera token)
- **NON** sa cosa sia HTTP o Database

**Esempio (Professional)**:

```typescript
// services/auth.service.ts
class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtUtil: JwtUtil
  ) {}

  async login(email: string, password: string) {
    // Repository si occupa del DB
    const user = await this.userRepository.findByEmail(email);

    if (!user) throw new Error("User not found");

    // Business logic
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    // JWT utility
    const token = this.jwtUtil.sign({ userId: user.id });

    return { user, token };
  }
}
```

**Esempio (MVP - come lo facciamo noi)**:

```typescript
// services/auth.service.ts
class AuthService {
  async login(email: string, password: string) {
    // ⚠️ Chiamata diretta a Prisma (salta Repository)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) throw new Error("User not found");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new Error("Invalid password");

    const token = jwt.sign({ userId: user.id }, JWT_SECRET);

    return { user, token };
  }
}
```

#### 3. Repository (Data Access Layer)

**Cosa fa**:

- Unica interfaccia con il database
- Espone metodi semantici (es: `findByEmail`, `createUser`)
- Nasconde i dettagli di Prisma/ORM

**Esempio**:

```typescript
// repositories/user.repository.ts
class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({ where: { email } });
  }

  async create(data: CreateUserDto): Promise<User> {
    return prisma.user.create({ data });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}

export const userRepository = new UserRepository();
```

---

## 🔄 Come Refactorare da 2-Layer a 3-Layer (Futuro)

### Step 1: Creare la cartella Repository

```bash
mkdir backend/src/repositories
```

### Step 2: Estrarre tutte le chiamate Prisma dai Service

**Prima (2-layer)**:

```typescript
// auth.service.ts
const user = await prisma.user.findUnique({ where: { email } });
```

**Dopo (3-layer)**:

```typescript
// repositories/user.repository.ts
class UserRepository {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }
}

// auth.service.ts
const user = await userRepository.findByEmail(email);
```

### Step 3: Dependency Injection (opzionale ma professionale)

```typescript
// services/auth.service.ts
class AuthService {
  constructor(private userRepo: UserRepository) {}

  async login(email: string, password: string) {
    const user = await this.userRepo.findByEmail(email);
    // ...
  }
}

// Instanziazione
export const authService = new AuthService(userRepository);
```

---

## 📊 Vantaggi del Repository Pattern

### 1. Testabilità

**Senza Repository**:

```typescript
// ❌ Devi mockare tutto Prisma
jest.mock("@prisma/client");
```

**Con Repository**:

```typescript
// ✅ Mocki solo il repository
const mockUserRepo = {
  findByEmail: jest.fn().mockResolvedValue(fakeUser),
};

const authService = new AuthService(mockUserRepo);
```

### 2. Cambio ORM/Database

Se domani vuoi passare da Prisma a TypeORM o MongoDB:

**Senza Repository**: ❌ Devi cambiare TUTTI i Service  
**Con Repository**: ✅ Cambi solo i file nella cartella `repositories/`

### 3. Query Complesse Riutilizzabili

```typescript
// repository/user.repository.ts
async findActiveAdmins(): Promise<User[]> {
  return prisma.user.findMany({
    where: {
      role: 'ADMIN',
      isActive: true,
      lastLoginAt: { gte: thirtyDaysAgo() }
    },
    orderBy: { createdAt: 'desc' }
  });
}

// Riusabile in più Service
await userRepository.findActiveAdmins(); // Semantico e chiaro
```

---

## 🎯 Quando Usare Cosa?

| Scenario                       | Architettura Consigliata |
| ------------------------------ | ------------------------ |
| MVP/Prototipo veloce           | 2-Layer                  |
| Progetto piccolo (<5 entità)   | 2-Layer                  |
| Progetto medio/grande          | 3-Layer con Repository   |
| Team multi-developer           | 3-Layer con Repository   |
| Progetto con testing estensivo | 3-Layer con Repository   |
| Portfolio per Senior+          | 3-Layer con Repository   |

---

## 📝 Checklist Refactoring (Post-MVP)

Per trasformare TalentHive da 2-layer a 3-layer professionale:

- [ ] Creare `repositories/user.repository.ts`
- [ ] Creare `repositories/job.repository.ts`
- [ ] Creare `repositories/application.repository.ts`
- [ ] Estrarre tutte le chiamate `prisma.*` dai Service
- [ ] Aggiornare i Service per usare i Repository
- [ ] Aggiungere unit test ai Service (ora mockabili)
- [ ] (Opzionale) Implementare Dependency Injection con tsyringe/inversify

**Stima tempo**: ~4-6 ore per 3 entità

---

## 🔗 Risorse e Pattern Simili

- **Clean Architecture** (Uncle Bob): Controller → Use Case → Repository → Entity
- **Hexagonal Architecture**: Ports & Adapters
- **DDD (Domain-Driven Design)**: Simile ma più complesso

**TalentHive attuale**: Simplified Layered Architecture (pragmatico per MVP)  
**TalentHive ideale**: Clean Architecture con Repository Pattern
