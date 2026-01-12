# TalentHive 🐝

**Modern Applicant Tracking System (ATS)** - Full-stack monorepo with React 19, Express, Prisma, PostgreSQL, and MinIO.

> Single-tenant CRM-style recruitment platform with Kanban workflow, RBAC, and CV upload.

---

## 📋 Table of Contents

- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Project Structure](#-project-structure)
- [User Roles](#-user-roles)
- [API Overview](#-api-overview)
- [Development](#-development)

---

## 🛠️ Tech Stack

### Frontend

- **React 19** + **TypeScript**
- **Vite 7** (build tool)
- **TailwindCSS 4** (styling)
- **TanStack Query** (data fetching)
- **React Router** (routing with RBAC)

### Backend

- **Node.js** + **Express** (REST API)
- **Prisma ORM** (database)
- **PostgreSQL** (database)
- **MinIO** (object storage for CVs)
- **JWT** (authentication with httpOnly cookies)
- **Multer** (file upload middleware)

### Infrastructure

- **Docker Compose** (local development)
- **Bun** (package manager)

---

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) installed (`curl -fsSL https://bun.sh/install | bash`)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) running

### 1. Clone and Install

```bash
git clone <repo-url>
cd talent-hive
bun install
```

### 2. Start Docker Services

```bash
# Start PostgreSQL + MinIO
docker-compose up -d

# Verify containers are running
docker ps
# Should see: talent-hive-postgres, talent-hive-minio
```

### 3. Setup Database

```bash
cd backend

# Run migrations
bun run db:migrate

# Seed database with test data
bun run db:seed
```

**Seed creates**:

- 1 Admin: `admin@talenthive.com` / `Admin123!`
- 2 Recruiters: `sara@talenthive.com` / `Sara123!`, `marco@talenthive.com` / `Marco123!`
- 3 Candidates: `mario@example.com` / `Mario123!`, etc.
- 5 Jobs (PUBLISHED, DRAFT, ARCHIVED)
- 6 Applications (various workflow states)

### 4. Start Backend

```bash
# From backend directory
bun run dev

# Server starts at http://localhost:3000
# Health check: http://localhost:3000/health
```

### 5. Start Frontend (Optional)

```bash
cd frontend
bun run dev

# App starts at http://localhost:5173
```

---

## 📁 Project Structure

```
talent-hive/
├── backend/                 # Express API
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.ts         # Test data
│   │   └── migrations/     # DB migrations
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, RBAC
│   │   ├── types/          # TypeScript types
│   │   └── utils/          # Helpers
│   └── test-api.http       # API tests (REST Client)
│
├── frontend/               # React app
│   └── src/
│       ├── features/       # Feature-based architecture
│       └── ...
│
├── docker-compose.yml      # PostgreSQL + MinIO
└── README.md
```

---

## 👥 User Roles

### 🔑 ADMIN

- Full access to all resources
- Can create/manage RECRUITER accounts
- Bypasses ownership checks

### 🕵️ RECRUITER

- Create and publish job postings
- View applications for **own jobs only**
- Manage Kanban workflow (NEW → SCREENING → INTERVIEW → OFFER)
- Hire/Reject candidates

### 👨‍💼 CANDIDATE

- Browse **PUBLISHED** jobs only
- Apply with CV upload (PDF, max 5MB)
- Track own application status

---

## 🔌 API Overview

### Auth

- `POST /api/auth/login` - Login (sets httpOnly cookie)
- `POST /api/auth/register` - Register (CANDIDATE self-register)
- `POST /api/auth/logout` - Logout

### Jobs

- `POST /api/jobs/list` - List jobs (RBAC filtered)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (RECRUITER/ADMIN)
- `PATCH /api/jobs/:id` - Update job (owner or ADMIN)
- `DELETE /api/jobs/:id` - Archive job (soft delete)

### Applications

- `POST /api/applications/list` - List applications (RBAC)
- `GET /api/applications/my` - Candidate's own apps
- `GET /api/applications/:id` - Get by ID
- `POST /api/applications` - Apply (with CV upload)
- `PATCH /api/applications/:id/workflow` - Move Kanban
- `POST /api/applications/:id/hire` - Hire candidate
- `POST /api/applications/:id/reject` - Reject candidate
- `PATCH /api/applications/:id/notes` - Add notes/score

**All endpoints require authentication** (JWT cookie).

---

## 💻 Development

### Database Commands

```bash
cd backend

# Create new migration
bun run db:migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
bun run db:reset

# Re-seed with test data
bun run db:seed

# Open Prisma Studio (database GUI)
bun run db:studio
```

### MinIO Access

- **Console**: http://localhost:9001
- **Username**: `minioadmin`
- **Password**: `minioadmin`
- **Bucket**: `talenthive-cvs`

### Docker Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild containers
docker-compose up -d --build
```

### Environment Variables

Backend uses `.env` file:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/talent_hive"

# JWT
JWT_SECRET="your-super-secret-key-change-in-production"
JWT_EXPIRES_IN="86400"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT="9000"
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"

# App
PORT="3000"
FRONTEND_URL="http://localhost:5173"
```

---

## 🧪 Testing

### Manual API Testing

Use `backend/test-api.http` with [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension:

1. Open `test-api.http` in VS Code
2. Click "Send Request" above each endpoint
3. Cookies are auto-managed between requests

### Example Test Flow

```http
### 1. Login as Recruiter
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "sara@talenthive.com",
  "password": "Sara123!"
}

### 2. List all jobs (Sara sees all)
POST http://localhost:3000/api/jobs/list
Content-Type: application/json

{
  "skip": 0,
  "take": 10
}
```

---

## 📊 Database Schema

### Key Models

**User**

- `role`: ADMIN | RECRUITER | CANDIDATE
- Stores: email, password (hashed), firstName, lastName

**Job**

- `status`: DRAFT | PUBLISHED | ARCHIVED
- `createdBy`: Owner (RECRUITER or ADMIN)
- Fields: title, description, location, salaryRange

**Application**

- `workflowStatus`: NEW | SCREENING | INTERVIEW | OFFER | DONE
- `finalDecision`: HIRED | REJECTED (nullable)
- `cvUrl`: Path to CV in MinIO
- Unique constraint: `[jobId, userId]` (one application per job)

---

## 🎯 Business Logic Highlights

### Workflow Separation

- **Internal workflow** (`workflowStatus`): Kanban for recruiters (flexible)
- **Final decision** (`finalDecision`): Public status for candidates (binary)

### RBAC Rules

- **Job visibility**: CANDIDATE sees only PUBLISHED, RECRUITER sees all (for own jobs), ADMIN sees all
- **Application management**: Only job owner or ADMIN can hire/reject
- **CV upload**: CANDIDATE-only, validated (PDF, 5MB max)

### Kanban Rules

- Flexible movement in WIP states (NEW → SCREENING → INTERVIEW → OFFER)
- `DONE` is terminal (cannot change once HIRED/REJECTED)

---

## 🚧 Roadmap

- [x] Backend API (Auth, Jobs, Applications)
- [x] Database schema with RBAC
- [x] CV upload to MinIO
- [ ] Frontend UI with React 19
- [ ] Kanban board component
- [ ] Email notifications
- [ ] Advanced search/filtering

---

## 📝 License

MIT

---

## 🤝 Contributing

This is a portfolio/learning project. Feedback welcome!
