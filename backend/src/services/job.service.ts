import { prisma } from "../libs/prisma";
import type { Job, JobStatus } from "@prisma/client";
import type {
  CreateJobDto,
  UpdateJobDto,
  ListJobsDto,
  UserWithoutPassword,
} from "@shared/types";
import type { PaginatedResponse } from "../types/pagination.types";

class JobService {
  /**
   * Get jobs list with pagination and filters
   * RBAC: CANDIDATE sees only PUBLISHED, RECRUITER/ADMIN see all
   */
  async getJobs(
    incomingQuery: ListJobsDto,
    user: UserWithoutPassword
  ): Promise<PaginatedResponse<Job>> {
    // Reassign to Prisma type for type safety
    const query: any = { ...incomingQuery };
    const { skip = 0, take = 10, where = {}, orderBy } = query;

    // Build safe where clause from scratch (NEVER copy where as-is!)
    const safeWhere: any = {};

    // RBAC: Enforce data visibility based on role
    if (user.role === "CANDIDATE") {
      // CANDIDATE: Only PUBLISHED jobs
      safeWhere.status = "PUBLISHED";
    } else if (user.role === "RECRUITER") {
      // RECRUITER: Can VIEW all PUBLISHED jobs (marketplace) + their own jobs (any status)
      // But can only MODIFY their own jobs (checked in update/delete methods)
      safeWhere.OR = [
        { status: "PUBLISHED" }, // All published jobs (marketplace)
        { createdById: user.id }, // Their own jobs (any status)
      ];

      // If filtering by specific status on their OWN jobs
      if (where?.status) {
        // Override: show only their jobs with that status
        delete safeWhere.OR;
        safeWhere.createdById = user.id;
        safeWhere.status = where.status;
      }
    } else if (user.role === "ADMIN") {
      // ADMIN: Can see all, optional status filter
      if (where?.status) {
        safeWhere.status = where.status;
      }
    }

    // Safe filters allowed for all roles (on their visible jobs)
    if (where?.title) {
      safeWhere.title = {
        contains:
          typeof where.title === "string" ? where.title : where.title.contains,
        mode: "insensitive",
      };
    }
    if (where?.location) {
      safeWhere.location = {
        contains:
          typeof where.location === "string"
            ? where.location
            : where.location.contains,
        mode: "insensitive",
      };
    }

    // Sanitize orderBy (default to createdAt desc)
    const safeOrderBy = orderBy?.createdAt
      ? { createdAt: orderBy.createdAt }
      : { createdAt: "desc" as const };

    // Build final query
    const safeQuery = {
      where: safeWhere,
      orderBy: safeOrderBy,
      skip,
      take: Math.min(take, 100), // Max 100 per query
    };

    // Execute query
    const [data, count] = await Promise.all([
      prisma.job.findMany(safeQuery),
      prisma.job.count({ where: safeWhere }),
    ]);

    return {
      data,
      count,
      query: safeQuery,
    };
  }

  /**
   * Get job by ID
   */
  async getJobById(id: string, user: UserWithoutPassword): Promise<Job> {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // RBAC: CANDIDATE can only see PUBLISHED
    if (user.role === "CANDIDATE" && job.status !== "PUBLISHED") {
      throw new Error("Job not found");
    }

    return job;
  }

  /**
   * Create new job
   * Only RECRUITER and ADMIN can create
   */
  async createJob(data: CreateJobDto, userId: string): Promise<Job> {
    return prisma.job.create({
      data: {
        ...data,
        status: "DRAFT",
        createdById: userId,
      },
    });
  }

  /**
   * Update job
   * Only owner or ADMIN can update
   */
  async updateJob(
    id: string,
    data: UpdateJobDto,
    user: UserWithoutPassword
  ): Promise<Job> {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Ownership check
    if (job.createdById !== user.id && user.role !== "ADMIN") {
      throw new Error("You can only update jobs you created");
    }

    return prisma.job.update({
      where: { id },
      data,
    });
  }

  /**
   * Archive job (soft delete)
   * Only owner or ADMIN can archive
   */
  async archiveJob(id: string, user: UserWithoutPassword): Promise<Job> {
    const job = await prisma.job.findUnique({
      where: { id },
    });

    if (!job) {
      throw new Error("Job not found");
    }

    // Ownership check
    if (job.createdById !== user.id && user.role !== "ADMIN") {
      throw new Error("You can only archive jobs you created");
    }

    return prisma.job.update({
      where: { id },
      data: { status: "ARCHIVED" },
    });
  }
}

export const jobService = new JobService();
