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
  removeRestrictedFields,
  setQueryDefaults,
} from "../utils/prisma-query.utils";

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

    const where = safeQuery.where || {};

    // RBAC: Override where clause based on role
    if (user.role === "CANDIDATE") {
      // Force: only user's own applications
      // Remove sensitive fields that candidates shouldn't filter on
      const candidateSafeWhere = removeRestrictedFields(where, [
        "workflowStatus",
        "finalDecision",
        "score",
        "notes",
      ]);
      safeQuery.where = { ...candidateSafeWhere, userId: user.id };
    } else if (user.role === "RECRUITER") {
      // Filter by jobs created by this recruiter
      if (where?.jobId) {
        // Check ownership
        const job = await prisma.job.findUnique({
          where: { id: where.jobId as string },
        });
        if (job && job.createdById !== user.id) {
          throw new Error("You can only view applications for your jobs");
        }
        safeQuery.where = { ...where, jobId: where.jobId };
      } else {
        // Get all applications for recruiter's jobs
        safeQuery.where = {
          ...where,
          job: {
            createdById: user.id,
          },
        };
      }
    }
    // ADMIN: No restrictions (all filters pass through)

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
      throw new Error("Application not found");
    }

    // RBAC check
    if (user.role === "CANDIDATE" && application.userId !== user.id) {
      throw new Error("Application not found");
    }

    if (user.role === "RECRUITER" && application.job.createdById !== user.id) {
      throw new Error("You can only view applications for your jobs");
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
      throw new Error("You have already applied to this job");
    }

    // Check if job exists and is PUBLISHED
    const job = await prisma.job.findUnique({
      where: { id: data.jobId },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "PUBLISHED") {
      throw new Error("This job is not accepting applications");
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
      throw new Error("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new Error("You can only update applications for your jobs");
    }

    // Check if already final
    if (application.workflowStatus === "DONE") {
      throw new Error("Cannot change status of finalized application");
    }

    return prisma.application.update({
      where: { id },
      data: { workflowStatus: newStatus },
    });
  }

  /**
   * Hire candidate (final action)
   */
  async hireCandidate(
    id: string,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new Error("You can only hire for your jobs");
    }

    if (application.workflowStatus === "DONE") {
      throw new Error("Application already finalized");
    }

    return prisma.application.update({
      where: { id },
      data: {
        workflowStatus: "DONE",
        finalDecision: "HIRED",
      },
    });
  }

  /**
   * Reject candidate (final action)
   */
  async rejectCandidate(
    id: string,
    reason: string | undefined,
    user: UserWithoutPassword,
  ): Promise<Application> {
    const application = await prisma.application.findUnique({
      where: { id },
      include: { job: true },
    });

    if (!application) {
      throw new Error("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new Error("You can only reject for your jobs");
    }

    if (application.workflowStatus === "DONE") {
      throw new Error("Application already finalized");
    }

    return prisma.application.update({
      where: { id },
      data: {
        workflowStatus: "DONE",
        finalDecision: "REJECTED",
        notes: reason || application.notes,
      },
    });
  }

  /**
   * Add notes/score to application
   */
  async updateNotes(
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
      throw new Error("Application not found");
    }

    // Ownership check
    if (user.role !== "ADMIN" && application.job.createdById !== user.id) {
      throw new Error("You can only update applications for your jobs");
    }

    return prisma.application.update({
      where: { id },
      data: {
        notes: notes !== undefined ? notes : application.notes,
        score: score !== undefined ? score : application.score,
      },
    });
  }
}

export const applicationService = new ApplicationService();
