# TalentHive MVP Specification (7-Day Sprint)

**Goal**: Build a high-quality, functioning Applicant Tracking System (ATS) portfolio piece demonstrating Full Stack competency, specialized architecture (MinIO, Docker), and product sense.

**Timeline**: 7 Days
**Tech Stack**: React 19 (Vite), Tailwind 4, Shadcn UI, Express, Prisma, PostgreSQL, MinIO (Docker).

---

## 1. Core Logic & Architecture

We prioritize **depth over breadth**. Instead of 50 half-baked features, we build 3 features perfectly.

### The "SaaS" Model (Mocked for MVP)

- **Single Tenant/Admin**: The app acts as if "We" are the company hiring.
- **Roles**:
  - **Recruiter (Admin)**: Can manage jobs and move candidates.
  - **Candidate (Public)**: Can only submit applications.

---

## 2. Functional Requirements (The "Must Haves")

### A. The Dashboard (Recruiter View) - _The "Wow" Factor_

1.  **Kanban Board**:
    - **Visual**: 5 Columns (New, Screening, Interview, Offer, Hired).
    - **Interaction**: Drag & Drop cards between columns.
    - **Persistence**: Moving a card updates the status in PostgreSQL immediately.
2.  **Job Management (Drawer)**:
    - Create a new Job (Title, Description, Requirements status=OPEN).
    - Close a Job (status=CLOSED).

### B. The Application Flow (Candidate View)

1.  **Public Job Board**:
    - List of all `OPEN` jobs.
    - Click "Apply Now".
2.  **Application Form**:
    - Fields: Name, Email, Cover Letter (Text).
    - **CV Upload**: PDF only. Uploads securely to MinIO Object Storage.
    - **Feedback**: Success message "Application Sent!".

### C. Backend & Storage (The "Professional" Part)

1.  **MinIO Integration**:
    - Containers spin up with `docker-compose up`.
    - Backend acts as a secure gateway (Presigned URLs or Proxy) so the frontend never talks to MinIO directly.
    - **Scalability Proof**: This architecture is identical to using AWS S3 Pro.

---

## 3. Future Roadmap (The "Expandable" Part)

_Things we DO NOT build in 7 days, but the architecture supports:_

- **[ ] AI Resume Screening**: Use OpenAI API to read the text from the PDF (stored in MinIO) and auto-score the candidate (1-100).
- **[ ] Email Automations**: Send email via Resend/SendGrid when a candidate moves to "Interview".
- **[ ] Role-Based Access Control (RBAC)**: Limit what Hiring Managers vs Recruiters see.
- **[ ] Analytics**: "Time to Hire" charts.
- **[ ] Multi-Tenancy**: Support multiple companies.

---

## 4. Why this Portfolio Piece works?

- **It solves a real business problem** (not a TODO list).
- **It uses "Real" Infrastructure** (Postgres + Object Storage, not just local files).
- **It handles binary data** (PDFs), which is harder than just CRUD text.
