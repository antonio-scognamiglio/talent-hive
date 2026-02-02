# TalentHive MVP Specification (10-Day Sprint)

**Version**: 2.0 - Finalized  
**Updated**: 8 Gennaio 2026  
**Status**: ✅ Ready for Implementation

---

## 🎯 Project Vision

**TalentHive** is a **private, single-tenant ATS (Applicant Tracking System)** designed for a multinational company with multiple offices. Built as a CRM-style platform with role-based access control (RBAC), it streamlines the entire recruiting process from job posting to candidate hiring.

**Tech Stack**: React 19, Vite, Tailwind 4, Shadcn UI, Node.js, Express, Prisma, PostgreSQL, MinIO, Docker

**Timeline**: 10 giorni  
**Architecture**: Single-tenant, CRM UI with sidebar, JWT auth with httpOnly cookies

---

## 🏗️ Core Architecture Decisions

### Single-Tenant Model

- **One company** uses the entire platform
- Multiple offices/locations (stored as string in Job.location)
- Recruiters see only their own jobs ("I Miei Annunci")
- ADMIN has full visibility on all jobs
- No Organization or Department models (KISS principle)

### Authentication Model

- **Registration**: Only CANDIDATE role can self-register
- **Provisioning**: ADMIN creates RECRUITER accounts manually
- **All endpoints require authentication** (no public access)

### Three Roles Only

```
ADMIN → Platform super-user
RECRUITER → Job creator and candidate pipeline manager
CANDIDATE → Job applicant
```

---

## 🎭 Roles & Permissions Matrix

### 1. ADMIN (Super User)

**Purpose**: Platform administration and oversight

| Resource    | Create | Read   | Update | Delete |
| ----------- | ------ | ------ | ------ | ------ |
| User        | ✅ All | ✅ All | ✅ All | ✅ All |
| Job         | ✅ Any | ✅ All | ✅ All | ✅ All |
| Application | ❌     | ✅ All | ✅ All | ✅ All |

**Capabilities**:

- Create RECRUITER accounts
- Manage all users (promote/demote roles)
- Full CRUD on all jobs (bypass ownership)
- View all applications across all jobs
- Platform analytics and settings

**Business Rules**:

- Only ADMIN can create RECRUITER accounts
- Can override job ownership restrictions
- Cannot apply to jobs (not a CANDIDATE)

---

### 2. RECRUITER

**Purpose**: Create job postings and manage candidate pipeline

| Resource     | Create | Read        | Update          | Delete  |
| ------------ | ------ | ----------- | --------------- | ------- |
| User         | ❌     | ❌          | ❌              | ❌      |
| Job (Own)    | ✅     | ✅          | ✅              | ✅ Soft |
| Job (Others) | ❌     | ❌          | ❌              | ❌      |
| Application  | ❌     | ✅ Own Jobs | ✅ Status/Notes | ❌      |

**Capabilities**:

- CREATE new job postings (becomes owner via `createdById`)
- READ only their own jobs ("I Miei Annunci" view)
- UPDATE/DELETE only jobs they created (ownership rule)
- VIEW applications for their own jobs only
- UPDATE application status (workflow management)
- ADD notes and scores to candidates

**Business Rules**:

- Job ownership: `job.createdById === recruiter.id`
- Can archive own jobs (soft delete to ARCHIVED status)
- Cannot hard delete jobs (data retention)
- Cannot apply to jobs (not a CANDIDATE)

**Ownership Check**:

```typescript
if (job.createdById !== req.user.id && req.user.role !== "ADMIN") {
  throw new Error("You can only modify jobs you created");
}
```

---

### 3. CANDIDATE

**Purpose**: Apply to job openings and track application status

| Resource             | Create | Read         | Update | Delete |
| -------------------- | ------ | ------------ | ------ | ------ |
| User (Self)          | ✅     | ✅           | ✅     | ❌     |
| Job                  | ❌     | ✅ PUBLISHED | ❌     | ❌     |
| Application (Own)    | ✅     | ✅           | ❌     | ❌     |
| Application (Others) | ❌     | ❌           | ❌     | ❌     |

**Capabilities**:

- Self-register on the platform
- VIEW jobs with status PUBLISHED
- CREATE applications (one per job)
- VIEW own application status
- UPDATE own profile (name, email, CV)

**Business Rules**:

- Can only see jobs with `status = PUBLISHED`
- Cannot see DRAFT or ARCHIVED jobs
- One application per job (enforced by DB unique constraint)
- Cannot modify application status (read-only)
- Cannot see other candidates' applications

**Application Constraint**:

```prisma
@@unique([jobId, userId]) // Prevents duplicate applications
```

---

## 📊 Database Schema (Prisma)

### Enums

```prisma
enum Role {
  ADMIN
  RECRUITER
  CANDIDATE
}

enum JobStatus {
  DRAFT      // Visible only to creator + ADMIN
  PUBLISHED  // Visible to all authenticated users
  ARCHIVED   // Soft deleted, hidden from CANDIDATE
}

enum ApplicationStatus {
  NEW        // Just submitted
  SCREENING  // Under review
  INTERVIEW  // Scheduled for interview
  OFFER      // Offer extended
  HIRED      // Successfully hired
  REJECTED   // Not selected
}
```

---

### Models

```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // bcrypt hashed
  firstName String
  lastName  String
  role      Role     @default(CANDIDATE)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  jobsCreated  Job[]         @relation("JobCreator")
  applications Application[]
}

model Job {
  id          String    @id @default(uuid())
  title       String
  description String    @db.Text
  status      JobStatus @default(DRAFT)

  // Location as simple string (no Office model)
  location    String?   // "Milan - HQ", "New York Office", "Remote"
  salaryRange String?   // "€50k-€70k", "Competitive"

  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Ownership: who created this job
  createdById String
  createdBy   User @relation("JobCreator", fields: [createdById], references: [id])

  applications Application[]
}

model Application {
  id          String            @id @default(uuid())
  status      ApplicationStatus @default(NEW)
  cvUrl       String            // MinIO path: "cvs/{userId}/{jobId}.pdf"
  coverLetter String?           @db.Text
  score       Int?              // 1-5 rating by recruiter
  notes       String?           @db.Text // Recruiter notes

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  // Relations
  jobId  String
  job    Job    @relation(fields: [jobId], references: [id])

  userId String
  user   User   @relation(fields: [userId], references: [id])

  // Prevent duplicate applications
  @@unique([jobId, userId])
}
```

**Key Design Decisions**:

- ✅ No `Candidate` model (use `User` with `role=CANDIDATE`)
- ✅ No `Organization` or `Department` models (single-tenant)
- ✅ `location` as string (flexibility, no extra table)
- ✅ `createdBy` for job ownership (not `hiringManager`)
- ✅ Unique constraint on `[jobId, userId]` to prevent duplicates

---

## 🔄 User Flows (Complete Journeys)

### Flow 1: Candidate Registration & Application

1. **Landing Page** (Unauthenticated)
   - User visits `talenthive.com`
   - Sees login form + "Register as Candidate" link

2. **Registration**
   - User clicks "Register"
   - Fills form: `firstName`, `lastName`, `email`, `password`
   - Backend creates `User` with `role=CANDIDATE`
   - Auto-login with JWT cookie

3. **Dashboard (CANDIDATE)**
   - Sidebar: Dashboard, Available Jobs, My Applications, Settings
   - Main view: Welcome message + quick stats

4. **Browse Jobs**
   - Navigate to "Available Jobs"
   - Sees list of jobs with `status=PUBLISHED`
   - Filters by location, title (optional MVP feature)

5. **Apply to Job**
   - Click "Apply" on a job
   - Form: Cover Letter (textarea), Upload CV (PDF)
   - Submit → CV uploaded to MinIO
   - Application created with `status=NEW`
   - Success message: "Application submitted!"

6. **Track Application**
   - Navigate to "My Applications"
   - Sees list of own applications with status badges
   - Status updates in real-time (when recruiter moves in Kanban)

---

### Flow 2: Recruiter Job Management

1. **Account Provisioning**
   - ADMIN creates User with `role=RECRUITER`
   - ADMIN sends credentials to recruiter

2. **Login**
   - Recruiter logs in
   - Redirected to dashboard

3. **Dashboard (RECRUITER)**
   - Sidebar: Dashboard, Kanban Board, Jobs, Candidates, Settings
   - Main view: Quick stats (open jobs, active candidates, etc.)

4. **Create Job**
   - Navigate to "Jobs" → "Create New Job"
   - Form:
     - Title: "Senior React Developer"
     - Description: (rich text editor)
     - Location: "Milan - HQ"
     - Salary Range: "€50k-€70k"
     - Status: DRAFT (default)
   - Save → Job created with `createdById = recruiter.id`

5. **Publish Job**
   - Edit job → Change status to PUBLISHED
   - Job now visible to all CANDIDATE users

6. **Manage Applications (Kanban)**
   - Navigate to "Kanban Board"
   - Columns: NEW, SCREENING, INTERVIEW, OFFER, HIRED, REJECTED
   - Sees applications as cards
   - Drag & drop card from NEW → SCREENING
   - Backend updates `application.status`

7. **Review Candidate**
   - Click on application card
   - Modal/Drawer shows:
     - Candidate info (name, email)
     - CV download link (MinIO presigned URL)
     - Cover letter
     - Status history
     - Notes field
     - Score (1-5 stars)
   - Add note: "Strong React portfolio, schedule interview"
   - Save → Note persisted

8. **View All Jobs**
   - Navigate to "Jobs" → "All Jobs"
   - Sees ALL company jobs (not just own)
   - Read-only view for jobs created by others
   - Can edit/archive only own jobs

---

### Flow 3: Admin User Management

1. **Login as ADMIN**
   - Uses seeded admin account
   - Dashboard with admin-specific options

2. **Create RECRUITER Account**
   - Navigate to "User Management"
   - Click "Create User"
   - Form:
     - Email: `sara.rossi@company.com`
     - First Name: Sara
     - Last Name: Rossi
     - Role: RECRUITER (dropdown)
     - Temporary Password: (auto-generated)
   - Save → User created, credentials emailed (future feature)

3. **Manage All Jobs**
   - Navigate to "Jobs"
   - Sees ALL jobs
   - Can edit/delete ANY job (bypass ownership)

4. **Analytics (Future)**
   - Dashboard with charts
   - Candidates by status, Time to hire, etc.

---

## 🔌 API Endpoints Specification

### Authentication

| Endpoint             | Method | Auth | Body                                     | Response        |
| -------------------- | ------ | ---- | ---------------------------------------- | --------------- |
| `/api/auth/register` | POST   | ❌   | `{email, password, firstName, lastName}` | `User` + Cookie |
| `/api/auth/login`    | POST   | ❌   | `{email, password}`                      | `User` + Cookie |
| `/api/auth/logout`   | POST   | ✅   | -                                        | Success message |
| `/api/auth/me`       | GET    | ✅   | -                                        | Current `User`  |

---

### Jobs

| Endpoint        | Method | Auth | Roles            | Body                                      | Response                 |
| --------------- | ------ | ---- | ---------------- | ----------------------------------------- | ------------------------ |
| `/api/jobs`     | GET    | ✅   | All              | Query: `?status=PUBLISHED&skip=0&take=10` | `PaginatedResponse<Job>` |
| `/api/jobs/:id` | GET    | ✅   | All              | -                                         | `Job`                    |
| `/api/jobs`     | POST   | ✅   | RECRUITER, ADMIN | `CreateJobDto`                            | `Job`                    |
| `/api/jobs/:id` | PATCH  | ✅   | Owner OR ADMIN   | `UpdateJobDto`                            | `Job`                    |
| `/api/jobs/:id` | DELETE | ✅   | Owner OR ADMIN   | -                                         | Success message          |

**Business Rules**:

- GET: CANDIDATE sees only PUBLISHED, RECRUITER/ADMIN see all
- POST: `createdById` auto-set to `req.user.id`
- PATCH/DELETE: Ownership check (creator OR ADMIN)
- DELETE: Soft delete (set `status=ARCHIVED`)

---

### Applications

| Endpoint                       | Method | Auth | Roles                   | Body                            | Response                            |
| ------------------------------ | ------ | ---- | ----------------------- | ------------------------------- | ----------------------------------- |
| `/api/applications`            | GET    | ✅   | RECRUITER, ADMIN        | Query: `?jobId=xxx&status=NEW`  | `PaginatedResponse<Application>`    |
| `/api/applications/my`         | GET    | ✅   | CANDIDATE               | -                               | `Application[]`                     |
| `/api/applications/:id`        | GET    | ✅   | RECRUITER, ADMIN, Owner | -                               | `Application` with CV presigned URL |
| `/api/applications`            | POST   | ✅   | CANDIDATE               | `multipart/form-data` (CV file) | `Application`                       |
| `/api/applications/:id/status` | PATCH  | ✅   | RECRUITER, ADMIN        | `{status: "INTERVIEW"}`         | `Application`                       |
| `/api/applications/:id/notes`  | PATCH  | ✅   | RECRUITER, ADMIN        | `{notes, score}`                | `Application`                       |

**Business Rules**:

- POST: Checks `@@unique([jobId, userId])` constraint
- CV upload: Max 5MB, PDF only, stored in MinIO
- GET: CANDIDATE can only see own applications
- PATCH: Only RECRUITER/ADMIN can change status

---

## 🎨 UI/UX Structure (CRM Layout)

### Layout Components

```
┌─────────────────────────────────────────────────┐
│  Topbar                                         │
│  Logo | User Name | Notifications | Logout     │
├──────────┬──────────────────────────────────────┤
│          │                                      │
│ Sidebar  │  Main Content Area                   │
│          │                                      │
│ Nav      │  Page-specific content               │
│ Items    │  (Dashboard, Jobs, Kanban, etc.)     │
│          │                                      │
│          │                                      │
└──────────┴──────────────────────────────────────┘
```

### Sidebar Navigation (Role-Based)

**CANDIDATE Sidebar**:

```
🏠 Dashboard
💼 Available Jobs
📝 My Applications
⚙️ Settings
```

**RECRUITER Sidebar**:

```
🏠 Dashboard
📊 Kanban Board
💼 Jobs
  ├─ My Jobs
  ├─ All Jobs
  └─ Create New
👥 Candidates
⚙️ Settings
```

**ADMIN Sidebar**:

```
🏠 Dashboard
📊 Kanban Board
💼 All Jobs
👥 User Management
📈 Analytics (Future)
⚙️ Settings
```

---

## 🗂️ Frontend Routes (React Router)

```typescript
// Public routes
/ → Landing/Login page

// Protected routes (require auth)
/dashboard → Dashboard (role-based content)

// CANDIDATE routes
/jobs → Available jobs list
/jobs/:id → Job detail
/applications → My applications list

// RECRUITER routes
/kanban → Kanban board
/jobs/manage → My jobs list
/jobs/create → Create new job
/jobs/:id/edit → Edit job (ownership check)
/candidates → All applications list

// ADMIN routes
/admin/users → User management
/admin/analytics → Platform analytics

// Common
/settings → User settings
```

---

## 🔐 Security & Validation

### Password Policy

- Minimum 8 characters
- At least 1 uppercase, 1 lowercase, 1 number (future)
- Bcrypt hashing with salt rounds = 10

### JWT Configuration

- Expiry: 24 hours
- httpOnly cookie (XSS protection)
- SameSite: Strict (CSRF protection)

### File Upload Validation

- PDF only (MIME type check)
- Max size: 5MB
- Virus scan: Future enhancement

### Input Validation (Zod)

```typescript
const CreateJobSchema = z.object({
  title: z.string().min(5).max(100),
  description: z.string().min(50),
  location: z.string().optional(),
  salaryRange: z.string().optional(),
});
```

---

## 📈 Success Metrics (Portfolio)

**Technical Achievements**:

- ✅ Multi-role RBAC with ownership model
- ✅ JWT authentication with httpOnly cookies
- ✅ File upload to MinIO object storage
- ✅ Drag & drop Kanban board
- ✅ Responsive CRM-style UI with Shadcn
- ✅ Prisma ORM with PostgreSQL
- ✅ Docker Compose infrastructure

**Business Value**:

- Streamlined recruiting process
- Candidate pipeline visibility
- Role-based data isolation
- Scalable architecture (ready for multi-tenant)

---

## 🚀 Implementation Phases (10 Days)

### Phase 1: Foundation (Days 1-2) ✅

- [x] Docker Compose setup
- [x] PostgreSQL + MinIO
- [x] Prisma schema
- [x] JWT auth system

### Phase 2: Backend API (Days 3-4)

- [ ] Job CRUD endpoints
- [ ] Application endpoints with CV upload
- [ ] RBAC middleware
- [ ] Ownership checks

### Phase 3: Frontend Core (Days 5-7)

- [ ] Shadcn UI setup
- [ ] CRM layout with sidebar
- [ ] Auth pages (login/register)
- [ ] RBAC routing

### Phase 4: Features (Days 8-9)

- [ ] Job board (CANDIDATE)
- [ ] Application form with CV upload
- [ ] Kanban board (RECRUITER)
- [ ] Job management

### Phase 5: Polish (Day 10)

- [ ] Responsive design
- [ ] Error handling
- [ ] Loading states
- [ ] README + screenshots

---

## 🔮 Future Enhancements (Post-MVP)

### Phase 2 Features

- [ ] Email notifications (Resend/SendGrid)
- [ ] Advanced search & filters
- [ ] Candidate profile pages
- [ ] Interview scheduling
- [ ] Communication log

### Phase 3 Features

- [ ] AI resume screening (OpenAI)
- [ ] Analytics dashboard
- [ ] Export to PDF/CSV
- [ ] Multi-language support

### Phase 4 Features

- [ ] Multi-tenant architecture
- [ ] API webhooks
- [ ] Mobile app (React Native)
- [ ] Integration with LinkedIn/Indeed

---

## ✅ Definition of Done

An MVP is complete when:

- ✅ All 3 user flows work end-to-end
- ✅ RBAC enforced on all endpoints
- ✅ CV upload/download functional
- ✅ Kanban drag & drop working
- ✅ Responsive on mobile/desktop
- ✅ No critical bugs
- ✅ README with setup instructions
- ✅ Demo video/screenshots ready

---

**This specification is the source of truth for TalentHive MVP. All implementation decisions must align with this document.**
