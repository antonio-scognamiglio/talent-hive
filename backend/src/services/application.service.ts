import { prisma } from "../libs/prisma";
import type {
  Application,
  WorkflowStatus,
  FinalDecision,
} from "@prisma/client";
import type { TransactionResult, PaginationParams } from "../types/api.types";
import type { UserWithoutPassword } from "./auth.service";
import { storageService } from "./storage.service";

// DTO types
export type CreateApplicationDto = {
  jobId: string;
  coverLetter?: string;
};

export type ApplicationListQuery = PaginationParams & {
  where?: {
    jobId?: string;
    workflowStatus?: WorkflowStatus;
  };
};

class ApplicationService {
  /**
   * Get applications list
   * RBAC: CANDIDATE sees only their own, RECRUITER sees for their jobs, ADMIN sees all
   */
  async getApplications(
    query: ApplicationListQuery,
    user: UserWithoutPassword
  ): Promise<TransactionResult<Application>> {
    const { skip = 0, take = 10, where } = query;

    const safeWhere: any = {};

    if (user.role === "CANDIDATE") {
      // Force: only user's own applications
      safeWhere.userId = user.id;
    } else if (user.role === "RECRUITER") {
      // Filter by jobs created by this recruiter
      if (where?.jobId) {
        // Check ownership
        const job = await prisma.job.findUnique({
          where: { id: where.jobId },
        });
        if (job && job.createdById !== user.id) {
          throw new Error("You can only view applications for your jobs");
        }
        safeWhere.jobId = where.jobId;
      } else {
        // Get all applications for recruiter's jobs
        safeWhere.job = {
          createdById: user.id,
        };
      }
    }
    // ADMIN: no filter (sees all)

    // Safe filters (allowed for all)
    if (where?.workflowStatus) {
      safeWhere.workflowStatus = where.workflowStatus;
    }

    const [data, count] = await Promise.all([
      prisma.application.findMany({
        where: safeWhere,
        skip,
        take: Math.min(take, 100),
        include: {
          job: { select: { id: true, title: true, location: true } },
          user: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.application.count({ where: safeWhere }),
    ]);

    return { data, count };
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
    user: UserWithoutPassword
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
    userId: string
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
      "application/pdf"
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
    user: UserWithoutPassword
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
    user: UserWithoutPassword
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
    user: UserWithoutPassword
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
    user: UserWithoutPassword
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
