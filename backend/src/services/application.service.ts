import { prisma } from "../libs/prisma";
import type { Application, WorkflowStatus, Prisma } from "@prisma/client";
import type {
  UserWithoutPassword,
  CreateApplicationDto,
  ListApplicationsDto,
} from "@shared/types";
import type { PaginatedResponse } from "../types/pagination.types";
import { storageService } from "./storage.service";
import { sanitizePrismaQuery } from "../utils/sanitize-prisma-query.util";
import {
  mergeWhereAND,
  removeRestrictedFields,
  setQueryDefaults,
} from "../utils/prisma-query.utils";
import {
  ForbiddenError,
  NotFoundError,
  ValidationError,
  ConflictError,
} from "../errors/app.error";

class ApplicationService {
  /**
   * Get applications list
   * RBAC: CANDIDATE sees only their own, RECRUITER sees for their jobs, ADMIN sees all
   */
  async getApplications(
    incomingQuery: ListApplicationsDto,
    user: UserWithoutPassword,
  ): Promise<PaginatedResponse<Application>> {
    // Sanitize query with include depth limit and pagination cap
    let safeQuery: Prisma.ApplicationFindManyArgs = sanitizePrismaQuery(
      incomingQuery,
      { maxIncludeDepth: 1, maxTake: 100 },
    );

    // RBAC: Build unbypassable constraints using AND
    const rbacConstraints: Prisma.ApplicationWhereInput[] = [];
    let userFilters = safeQuery.where || {};

    if (user.role === "CANDIDATE") {
      // Force: only user's own applications
      // Remove sensitive fields that candidates shouldn't filter on
      userFilters =
        removeRestrictedFields(userFilters, [
          "workflowStatus",
          "finalDecision",
          "score",
          "notes",
        ]) || {};
      rbacConstraints.push({ userId: user.id });
    } else if (user.role === "RECRUITER") {
      // Filter by jobs created by this recruiter
      if (userFilters?.jobId) {
        // Check ownership of specific job
        const job = await prisma.job.findUnique({
          where: { id: userFilters.jobId as string },
        });
        if (job && job.createdById !== user.id) {
          throw new ForbiddenError(
            "You can only view applications for your jobs",
          );
        }
        // RBAC: Ensure jobId ownership (even though we checked above, enforce in query)
        rbacConstraints.push({
          job: { createdById: user.id },
        });
      } else {
        // Get all applications for recruiter's jobs (unbypassable)
        rbacConstraints.push({
          job: { createdById: user.id },
        });
      }
    }
    // ADMIN: No RBAC restrictions

    // Combine RBAC constraints with user filters using AND
    if (rbacConstraints.length > 0) {
      safeQuery.where = mergeWhereAND([
        ...rbacConstraints,
        ...(userFilters && Object.keys(userFilters).length > 0
          ? [userFilters]
          : []),
      ]) as Prisma.ApplicationWhereInput;
    } else {
      safeQuery.where = userFilters;
    }

    // Set defaults using utility
    safeQuery = setQueryDefaults(safeQuery, {
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" as const },
    });

    // Ensure include is set (needed for job and user data)
    safeQuery.include = {
      job: { select: { id: true, title: true, location: true } },
      user: {
        select: { id: true, email: true, firstName: true, lastName: true },
      },
    };

    const [data, count] = await Promise.all([
      prisma.application.findMany(safeQuery),
      prisma.application.count({ where: safeQuery.where }),
    ]);

    return {
      data,
      count,
      query: safeQuery,
    };
  }

  /**
   * Get candidate's own applications
   */
  async getMyCandidateApplications(userId: string): Promise<Application[]> {
    return prisma.application.findMany({
      where: { userId },
      include: {
        job: { select: { id: true, title: true, location: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Get application by ID
   */
  async getApplicationById(
    id: string,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        job: true,
        user: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // RBAC check
    if (user.role === "CANDIDATE" && application.userId !== user.id) {
      throw new Error("Application not found");
    }

    if (user.role === "RECRUITER" && application.job.createdById !== user.id) {
      throw new ForbiddenError("You can only view applications for your jobs");
    }

    return application;
  }

  /**
   * Create application (apply for job)
   * Only CANDIDATE can apply
   */
  async createApplication(
    data: CreateApplicationDto,
    cvBuffer: Buffer,
    cvOriginalName: string,
    userId: string,
  ): Promise<Application> {
    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        jobId_userId: {
          jobId: data.jobId,
          userId,
        },
      },
    });

    if (existing) {
      throw new ConflictError("You have already applied to this job");
    }

    // Check if job exists and is PUBLISHED
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new NotFoundError("Job not found");
    }

    if (job.status !== "PUBLISHED") {
      throw new ValidationError("This job is not accepting applications");
    }

    // Upload CV to MinIO
    const cvUrl = await storageService.uploadFile(
      cvBuffer,
      `cvs/${userId}/${data.jobId}/${cvOriginalName}`,
      "application/pdf",
    );

    // Create application
    return prisma.application.create({
      data: {
        jobId: data.jobId,
        userId,
        cvUrl,
        coverLetter: data.coverLetter,
        workflowStatus: "NEW",
      },
      include: {
        job: { select: { id: true, title: true, location: true } },
      },
    });
  }

  /**
   * Update workflow status (Kanban drag & drop)
   * Only recruiter who owns job or ADMIN
   */
  async updateWorkflowStatus(
    id: string,
    newStatus: WorkflowStatus,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new Error("You can only update applications for your jobs");
    }

    // Check if already final
    if (application.workflowStatus === "DONE") {
      throw new ValidationError(
        "Cannot change status of finalized application",
      );
    }

    // 🔒 SECURITY: Prevent manual DONE status
    // DONE can only be set via hireCandidate() or rejectCandidate()
    if (newStatus === "DONE") {
      throw new ValidationError(
        "DONE status can only be set through hire or reject actions",
      );
    }

    return prisma.application.update({
      where: { id },
      data: { workflowStatus: newStatus },
    });
  }

  /**
   * Hire candidate (final action)
   * Optionally updates notes/score before finalizing
   */
  async hireCandidate(
    id: string,
    notes: string | undefined,
    score: number | undefined,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new ForbiddenError("You can only hire for your jobs");
    }

    if (application.workflowStatus === "DONE") {
      throw new ValidationError("Application already finalized");
    }

    return prisma.application.update({
      where: { id },
      data: {
        workflowStatus: "DONE",
        finalDecision: "HIRED",
        notes: notes !== undefined ? notes : application.notes,
        score: score !== undefined ? score : application.score,
      },
    });
  }

  /**
   * Reject candidate (final action)
   * Optionally updates notes/score before finalizing
   */
  async rejectCandidate(
    id: string,
    reason: string | undefined,
    notes: string | undefined,
    score: number | undefined,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new ForbiddenError("You can only reject for your jobs");
    }

    if (application.workflowStatus === "DONE") {
      throw new ValidationError("Application already finalized");
    }

    // notes priority: explicit notes > reason > existing notes
    const finalNotes =
      notes !== undefined ? notes : reason || application.notes;

    return prisma.application.update({
      where: { id },
      data: {
        workflowStatus: "DONE",
        finalDecision: "REJECTED",
        notes: finalNotes,
        score: score !== undefined ? score : application.score,
      },
    });
  }

  /**
   * Update application (workflow status, notes, score)
   * Used by recruiter in EDIT mode to batch save changes
   */
  async updateApplication(
    id: string,
    workflowStatus: WorkflowStatus | undefined,
    notes: string | undefined,
    score: number | undefined,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new ForbiddenError(
        "You can only update applications for your jobs",
      );
    }

    // Check if already final
    if (application.workflowStatus === "DONE") {
      throw new ValidationError("Cannot update finalized application");
    }

    // Validate workflowStatus if provided
    if (workflowStatus && workflowStatus === "DONE") {
      throw new ValidationError(
        "DONE status can only be set through hire or reject actions",
      );
    }

    return prisma.application.update({
      where: { id },
      data: {
        workflowStatus: workflowStatus || application.workflowStatus,
        notes: notes !== undefined ? notes : application.notes,
        score: score !== undefined ? score : application.score,
      },
    });
  }

  /**
   * Get presigned URL to download CV
   * RBAC: CANDIDATE sees only their own CV, RECRUITER sees for their jobs, ADMIN sees all
   */
  async getCvDownloadUrl(
    id: string,
    user: UserWithoutPassword,
  ): Promise<string> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new NotFoundError("Application not found");
    }

    // RBAC check
    if (user.role === "CANDIDATE" && application.userId !== user.id) {
      throw new Error("Application not found");
    }

    if (user.role === "RECRUITER" && application.job.createdById !== user.id) {
      throw new ForbiddenError(
        "You can only view CVs for applications to your jobs",
      );
    }

    // Generate presigned URL (valid for 24h)
    return storageService.getPresignedUrl(application.cvUrl);
  }

  /**
   * Get application statistics (counts by workflow status)
   * RBAC: RECRUITER sees stats for their jobs, ADMIN sees all
   * @param filters - Optional jobId filter
   * @param user - Authenticated user
   */
  async getApplicationStats(
    filters: { jobId?: string },
    user: UserWithoutPassword,
  ): Promise<Array<{ status: WorkflowStatus; count: number }>> {
    // Defense-in-depth: Block CANDIDATE access at service level
    if (user.role === "CANDIDATE") {
      throw new ForbiddenError("Access denied");
    }

    // Build where clause based on RBAC
    let where: Prisma.ApplicationWhereInput = {};

    if (user.role === "RECRUITER") {
      // Recruiter sees only applications for their jobs
      if (filters.jobId) {
        // Verify ownership of the specific job
        const job = await prisma.job.findUnique({
          where: { id: filters.jobId },
        });

        if (!job) {
          throw new NotFoundError("Job not found");
        }

        if (job.createdById !== user.id) {
          throw new ForbiddenError("Access denied");
        }

        where.jobId = filters.jobId;
      } else {
        // All applications for recruiter's jobs
        where.job = {
          createdById: user.id,
        };
      }
    } else if (user.role === "ADMIN") {
      // Admin can filter by jobId or see all
      if (filters.jobId) {
        where.jobId = filters.jobId;
      }
    }
    // CANDIDATE role should not access this endpoint (handled by route-level RBAC)

    // Use Prisma groupBy to count by workflow status
    const stats = await prisma.application.groupBy({
      by: ["workflowStatus"],
      where,
      _count: {
        workflowStatus: true,
      },
    });

    // Transform to desired format
    return stats.map((stat) => ({
      status: stat.workflowStatus,
      count: stat._count.workflowStatus,
    }));
  }
}

export const applicationService = new ApplicationService();
