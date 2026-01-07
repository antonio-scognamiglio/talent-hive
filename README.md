# TalentHive 🐝

### Intelligent Applicant Tracking System (ATS)

> **Portfolio Project showcasing Advanced Frontend Architecture & Full-Stack Typesafety**

## 📖 Product Overview

**TalentHive** is a modern recruitment platform designed to streamline the hiring process by connecting **Candidates**, **Recruiters**, and **Hiring Managers** in a single, unified interface.

Instead of disjointed emails and spreadsheets, TalentHive provides a structured pipeline for managing job applications from "Applied" to "Hired".

### 🎯 Core Objectives

1.  **Centralized Hiring Pipeline**: Visualize the status of every candidate in real-time.
2.  **Role-Based Access Control (RBAC)**: Secure, distinct experiences for different user types.
3.  **Modern UX**: Fast, responsive, and intuitive interface built with the latest web standards.

---

## 👥 User Roles & Features

### 1. 👨‍💼 Candidate

_The job seeker looking for their next opportunity._

- **Browse Jobs**: Search and filter open positions.
- **Apply**: Submit streamlined applications with profile data.
- **Track Status**: See exactly where their application sits in the queue (e.g., "Screening", "Interview", "Offer").

### 2. 🕵️‍♀️ Recruiter

_The power user managing the intake._

- **Job Management**: Create and publish job postings.
- **Pipeline Overview**: Kanban-style view of all applicants.
- **Screening**: Review resumes and move candidates to "Shortlisted" or "Rejected".

### 3. 🤝 Hiring Manager

_The decision maker for specific roles._

- **Review Shortlists**: See only the candidates vetted by recruiters.
- **Interview Feedback**: Leave notes and scoring for candidates.
- **Hire/No-Hire**: Make the final decision.

---

## 🏗️ Technical Architecture

This project demonstrates a production-grade **Feature-Based Architecture**, designed for scalability and maintainability.

### Tech Stack

- **Runtime**: [Bun](https://bun.sh) (Package Manager & Runtime)
- **Frontend**: React 19, Vite 7, TypeScript, Tailwind CSS 4
- **Backend**: Node.js (Express), Prisma ORM
- **Database**: PostgreSQL
- **Design Pattern**: Feature-Sliced / Domain-Driven Design (DDD) frontend structure.

### Key Architectural Highlights

- **Strict RBAC Routing**: Dynamic route protection based on user roles (`ADMIN`, `RECRUITER`, `HIRING_MANAGER`, `CANDIDATE`).
- **Modular Features**: Code is organized by business domain (e.g., `features/auth`, `features/job-board`) rather than technical type.
- **Shared Kernel**: Reusable UI components and utilities located in `features/shared`.

---

## 🚀 fast-start

```bash
# Install dependencies
bun install

# Start Backend
cd backend && bun dev

# Start Frontend
cd frontend && bun dev
```
