# TalentHive - Complete User Interaction Flows

**Version**: 1.0  
**Date**: 8 Gennaio 2026  
**Purpose**: Detailed scenarios covering all possible application lifecycle paths

---

## 🎭 Application Lifecycle States

```
┌─────────┐
│   NEW   │  ← Application just submitted
└────┬────┘
     ↓
┌──────────┐
│ SCREENING│  ← Recruiter reviewing CV/profile
└────┬─────┘
     ↓
┌───────────┐
│ INTERVIEW │  ← Candidate scheduled for interview
└────┬──────┘
     ↓
┌────────────┐
│   OFFER    │  ← Job offer extended
└─────┬──────┘
      ↓
  ┌───┴───┐
  ↓       ↓
┌──────┐ ┌──────────┐
│HIRED │ │ REJECTED │  ← Final states
└──────┘ └──────────┘
```

**Note**: Da qualsiasi stato si può andare a REJECTED

---

## 📊 Scenario 1: Happy Path (Candidate Gets Hired)

### Timeline: Application → Hired

**Day 0: Application Submission**

**CANDIDATE (Mario Rossi)**:

1. Login to TalentHive
2. Navigate to "Available Jobs"
3. Find "Senior React Developer - Milan"
4. Click "Apply"
5. Fill form:
   - Cover Letter: "5 years React experience..."
   - Upload CV: `mario_rossi_cv.pdf`
6. Submit

**System**:

```typescript
// Backend creates:
Application {
  id: "app-123",
  status: NEW,
  jobId: "job-456",
  userId: "mario-user-id",
  cvUrl: "cvs/mario-user-id/job-456.pdf",
  coverLetter: "5 years React...",
  createdAt: "2026-01-08T10:30:00Z"
}
```

**CANDIDATE sees**:

- Success toast: "✅ Application submitted successfully!"
- Redirect to "My Applications"
- Application card shows: Status badge "NEW" (blue)

---

**Day 1: Recruiter Reviews**

**RECRUITER (Sara)**:

1. Login to TalentHive
2. Dashboard shows notification: "3 new applications"
3. Navigate to "Kanban Board"
4. Sees Mario's card in "NEW" column:
   ```
   ┌────────────────────────┐
   │ Mario Rossi            │
   │ Senior React Dev       │
   │ 📎 CV | 💬 Cover Letter│
   │ ⏱️ 1 day ago           │
   └────────────────────────┘
   ```
5. Click card → Drawer opens
6. Reviews:
   - Cover letter
   - Downloads CV (MinIO presigned URL)
   - CV looks good: 5 years React, Node, TypeScript
7. Adds note: "Strong portfolio, React + TypeScript expert"
8. **Drags card from NEW → SCREENING**

**System**:

```typescript
// PATCH /api/applications/app-123/status
Application.update({
  status: SCREENING,
  updatedAt: "2026-01-09T09:15:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Navigate to "My Applications"
- Status badge changed: "SCREENING" (orange)
- Timestamp: "Updated 5 minutes ago"

---

**Day 3: Schedule Interview**

**RECRUITER (Sara)**:

1. Kanban Board → SCREENING column
2. Reviews Mario's profile again
3. Decision: "Let's interview him"
4. **Drags card from SCREENING → INTERVIEW**
5. Adds note: "Schedule interview for next Tuesday"

**System**:

```typescript
Application.update({
  status: INTERVIEW,
  updatedAt: "2026-01-11T14:20:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Status badge: "INTERVIEW" (green)
- (Future: Email notification "You've been shortlisted!")

---

**Day 10: Interview Completed, Offer Extended**

**RECRUITER (Sara)**:

1. After successful interview
2. Kanban Board → INTERVIEW column
3. **Drags Mario's card → OFFER**
4. Adds note: "Interview excellent, extending offer €65k"
5. Score: ⭐⭐⭐⭐⭐ (5/5)

**System**:

```typescript
Application.update({
  status: OFFER,
  score: 5,
  notes: "Interview excellent, extending offer €65k",
  updatedAt: "2026-01-18T16:00:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Status badge: "OFFER" (purple)
- Excitement! 🎉

---

**Day 15: Offer Accepted**

**RECRUITER (Sara)**:

1. Mario accepted the offer
2. **Drags card from OFFER → HIRED**

**System**:

```typescript
Application.update({
  status: HIRED,
  updatedAt: "2026-01-23T10:00:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Status badge: "HIRED" (dark green)
- Congratulations message!

---

## 🚫 Scenario 2: Rejection After Interview

**Day 0-10**: Same as Scenario 1 (up to INTERVIEW)

**Day 12: Interview Didn't Go Well**

**RECRUITER (Sara)**:

1. After interview, not a good fit
2. Kanban Board → INTERVIEW column
3. **Drags Mario's card → REJECTED**
4. Adds note: "Lacks experience in Node.js backend"
5. Score: ⭐⭐ (2/5)

**System**:

```typescript
Application.update({
  status: REJECTED,
  score: 2,
  notes: "Lacks experience in Node.js backend",
  updatedAt: "2026-01-20T14:00:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Status badge: "REJECTED" (red)
- (Future: Polite rejection email)

**Business Rule**:

- Once REJECTED, application is final (no further changes)
- Candidate cannot re-apply to same job (unique constraint)

---

## ⏩ Scenario 3: Fast Rejection (Unqualified CV)

**Day 0**: Mario applies to "Senior React Developer"

**Day 1: Recruiter Quick Review**

**RECRUITER (Sara)**:

1. Kanban Board → NEW column
2. Opens Mario's card
3. Downloads CV
4. CV shows: "Junior developer, 6 months React"
5. Decision: Not senior enough
6. **Drags directly from NEW → REJECTED**
7. Adds note: "Profile too junior for senior role"

**System**:

```typescript
Application.update({
  status: REJECTED,
  notes: "Profile too junior for senior role",
  updatedAt: "2026-01-09T10:00:00Z",
});
```

**CANDIDATE (Mario) sees**:

- Status changed NEW → REJECTED in 1 day
- Can apply to other jobs (Junior roles)

---

## 👥 Scenario 4: Multiple Recruiters (Collaboration)

**Context**: Job "Frontend Engineer - Remote" created by Sara

**Day 0**: Mario applies

**Day 2: Sara starts reviewing**

**RECRUITER (Sara)**:

1. Drags Mario from NEW → SCREENING
2. Adds note: "Good React skills, need to check TypeScript"

**Day 3: Another recruiter (Marco) joins**

**RECRUITER (Marco)**:

1. Navigate to Kanban Board (sees ALL applications)
2. Sees Mario in SCREENING column (created by Sara)
3. Opens Mario's card
4. Reads Sara's notes
5. Adds his own note: "Reviewed TypeScript projects - excellent!"
6. Drags Mario from SCREENING → INTERVIEW

**System** (notes are cumulative):

```typescript
Application {
  notes: "Good React skills, need to check TypeScript\n\nReviewed TypeScript projects - excellent!",
  status: INTERVIEW
}
```

**Business Rule**:

- ANY recruiter can move ANY candidate (collaborative)
- Job ownership only applies to CRUD on Job, not on Applications

---

## 🔄 Scenario 5: Offer Declined by Candidate

**Day 0-10**: Same as Scenario 1 (up to OFFER)

**Day 16: Candidate Declines Offer**

**CANDIDATE (Mario)**:

- Receives email/call: "We extend offer €65k"
- Mario: "Thank you, but I accepted another offer"

**RECRUITER (Sara)**:

1. Kanban Board → OFFER column
2. Opens Mario's card
3. **Drags from OFFER → REJECTED**
4. Adds note: "Candidate declined offer - accepted elsewhere"

**System**:

```typescript
Application.update({
  status: REJECTED,
  notes: "Candidate declined offer - accepted elsewhere",
  updatedAt: "2026-01-24T09:00:00Z",
});
```

**Why REJECTED not a new status?**

- Keeps states simple (no "DECLINED" state)
- REJECTED = any negative outcome
- Note field clarifies the reason

---

## 📱 Scenario 6: Candidate Checks Status (Passive Waiting)

**CANDIDATE (Mario)**: Applied to 3 jobs

**Day 0**: Apply to Job A, B, C

**Day 3**: Check status

**CANDIDATE Actions**:

1. Login to TalentHive
2. Navigate to "My Applications"
3. Sees table:

| Job Title        | Company | Status       | Applied | Last Updated |
| ---------------- | ------- | ------------ | ------- | ------------ |
| Senior React Dev | -       | SCREENING    | 3d ago  | 1d ago       |
| Backend Engineer | -       | NEW          | 3d ago  | 3d ago       |
| Frontend Lead    | -       | INTERVIEW 🎉 | 3d ago  | 2h ago       |

4. Click "Frontend Lead" row
5. Detail page shows:
   - Job description
   - Application timeline:
     ```
     Jan 8: Applied (NEW)
     Jan 10: Under Review (SCREENING)
     Jan 11: Interview Scheduled (INTERVIEW) ← Current
     ```
   - Download own CV
   - Cover letter

**CANDIDATE limitations**:

- ❌ Cannot see recruiter notes
- ❌ Cannot see score
- ❌ Cannot change status
- ✅ Can only VIEW

---

## 🔍 Scenario 7: Recruiter Searches Candidate

**Context**: Recruiter wants to find all applications from a specific candidate

**RECRUITER (Sara)**:

1. Navigate to "Candidates" page
2. Search: "Mario Rossi"
3. Sees all Mario's applications across ALL jobs:

| Job Title    | Status   | Applied | Score      | Notes      |
| ------------ | -------- | ------- | ---------- | ---------- |
| Senior React | REJECTED | 2w ago  | ⭐⭐       | Too junior |
| Frontend Eng | HIRED    | 1m ago  | ⭐⭐⭐⭐⭐ | Excellent! |

4. Insight: "Mario was rejected before, but improved!"

**Feature** (Future MVP):

- Candidate profile page showing application history
- Useful for re-applications

---

## 🎯 Scenario 8: Job Is Archived (No New Applications)

**Day 0**: Job "Senior React" is PUBLISHED

**Day 30**: Position filled

**RECRUITER (Sara)**:

1. Navigate to "Jobs" → "My Jobs"
2. Find "Senior React Developer"
3. Click "Archive" button
4. Confirm modal: "Are you sure? No new applications will be accepted"
5. Job status changed to ARCHIVED

**System**:

```typescript
Job.update({
  status: ARCHIVED,
  updatedAt: "2026-02-07T10:00:00Z",
});
```

**Effect**:

- Job NO LONGER visible in "Available Jobs" (CANDIDATE)
- Existing applications still visible/manageable
- Recruiter can still move existing candidates in Kanban

**CANDIDATE (New User)**:

- Visits "Available Jobs"
- Does NOT see "Senior React Developer"

**CANDIDATE (Already Applied)**:

- Sees own application in "My Applications"
- Status still updates if recruiter moves them

---

## 🚨 Edge Cases & Business Rules

### Edge Case 1: Duplicate Application

**Scenario**:

1. Mario applies to "Senior React Dev" (Application exists)
2. Mario tries to apply AGAIN to same job

**Frontend**:

- "Apply" button disabled or shows "Already Applied"

**Backend** (if frontend fails):

```typescript
// Unique constraint violation
throw new Error("You have already applied to this job");
```

**Database**:

```prisma
@@unique([jobId, userId]) // Enforces this
```

---

### Edge Case 2: Job Deleted (Rare)

**Scenario**: ADMIN hard-deletes a job

**Effect**:

- Applications orphaned (jobId points to deleted job)

**Solution** (Prisma):

```prisma
job Job @relation(fields: [jobId], references: [id], onDelete: Cascade)
```

- If Job is deleted, Applications are also deleted (cascade)

**Recommendation**:

- Never hard delete Jobs
- Always use soft delete (status = ARCHIVED)

---

### Edge Case 3: Recruiter Leaves Company

**Scenario**: Sara (recruiter) is terminated, account deleted

**Effect**:

- Jobs created by Sara still exist (orphaned)

**Solution 1** (Soft delete User):

```typescript
User.update({ isActive: false }); // Don't hard delete
```

**Solution 2** (Re-assign ownership):

```typescript
// Admin re-assigns Sara's jobs to Marco
Job.updateMany({
  where: { createdById: saraId },
  data: { createdById: marcoId },
});
```

**MVP Decision**: Soft delete users (isActive flag in future)

---

## 📊 Summary: Who Can Do What

### Application Status Changes

| From      | To        | Who Can Do It           |
| --------- | --------- | ----------------------- |
| NEW       | SCREENING | RECRUITER, ADMIN        |
| NEW       | REJECTED  | RECRUITER, ADMIN        |
| SCREENING | INTERVIEW | RECRUITER, ADMIN        |
| SCREENING | REJECTED  | RECRUITER, ADMIN        |
| INTERVIEW | OFFER     | RECRUITER, ADMIN        |
| INTERVIEW | REJECTED  | RECRUITER, ADMIN        |
| OFFER     | HIRED     | RECRUITER, ADMIN        |
| OFFER     | REJECTED  | RECRUITER, ADMIN        |
| Any       | REJECTED  | RECRUITER, ADMIN        |
| REJECTED  | Any       | ❌ Nobody (final state) |
| HIRED     | Any       | ❌ Nobody (final state) |

**Rule**: CANDIDATE never changes status (read-only)

---

### Application Data Access

| Action                    | CANDIDATE | RECRUITER | ADMIN |
| ------------------------- | --------- | --------- | ----- |
| View own application      | ✅        | N/A       | ✅    |
| View others' applications | ❌        | ✅        | ✅    |
| Download own CV           | ✅        | ✅        | ✅    |
| Download others' CV       | ❌        | ✅        | ✅    |
| See recruiter notes       | ❌        | ✅        | ✅    |
| See score (1-5)           | ❌        | ✅        | ✅    |
| Add notes                 | ❌        | ✅        | ✅    |
| Change status             | ❌        | ✅        | ✅    |

---

## 🎬 Notification Flow (Future Enhancement)

**Trigger**: Status changes

**CANDIDATE receives email**:

- NEW → SCREENING: "Your application is under review"
- SCREENING → INTERVIEW: "🎉 You've been shortlisted!"
- INTERVIEW → OFFER: "Congratulations! Job offer extended"
- OFFER → HIRED: "Welcome to the team!"
- Any → REJECTED: "Thank you for your interest..."

**Implementation** (Post-MVP):

```typescript
// In application.service.ts
async updateStatus(id, newStatus) {
  const app = await prisma.application.update({ ... });

  // Trigger email
  await emailService.sendStatusUpdate(app.user.email, newStatus);

  return app;
}
```

---

## ✅ Key Takeaways

1. **Linear progression**: NEW → SCREENING → INTERVIEW → OFFER → HIRED
2. **Shortcuts allowed**: Can go directly NEW → REJECTED
3. **Final states**: HIRED and REJECTED are terminal (no further changes)
4. **Collaborative**: Any recruiter can move any candidate
5. **Candidate = passive observer**: Can only VIEW status, not change it
6. **Notes are cumulative**: Multiple recruiters can add notes
7. **Unique constraint**: One application per (candidate, job) pair

---

**This document covers all realistic scenarios. Use it as reference when implementing UI/UX for each user flow.**
