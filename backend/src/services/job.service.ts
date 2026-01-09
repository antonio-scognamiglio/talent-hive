import { prisma } from "../libs/prisma";
import type { Job, JobStatus } from "@prisma/client";
import type { TransactionResult, PaginationParams } from "../types/api.types";
import type { UserWithoutPassword } from "../types/user.types";

// DTO types
export type CreateJobDto = {
  title: string;
  description: string;
  location?: string;
  salaryRange?: string;
};

export type UpdateJobDto = Partial<CreateJobDto> & {
  status?: JobStatus;
};

export type JobListQuery = PaginationParams & {
  where?: {
    status?: JobStatus;
    title?: { contains: string; mode?: "insensitive" };
    location?: { contains: string; mode?: "insensitive" };
  };
  orderBy?: {
    createdAt?: "asc" | "desc";
  };
};

class JobService {
  /**
   * Get jobs list with pagination and filters
   * RBAC: CANDIDATE sees only PUBLISHED, RECRUITER/ADMIN see all
   */
  async getJobs(
    query: JobListQuery,
    user: UserWithoutPassword
  ): Promise<TransactionResult<Job>> {
    const { skip = 0, take = 10, where, orderBy } = query;

    // Sanitize where clause based on role
    const safeWhere: any = {};

    // RBAC: Force PUBLISHED for CANDIDATE
    if (user.role === "CANDIDATE") {
      safeWhere.status = "PUBLISHED";
    } else {
      // RECRUITER/ADMIN can filter by status
      if (where?.status) {
        safeWhere.status = where.status;
      }
    }

    // Safe filters (allowed for all)
    if (where?.title) {
      safeWhere.title = { contains: where.title.contains, mode: "insensitive" };
    }
    if (where?.location) {
      safeWhere.location = {
        contains: where.location.contains,
        mode: "insensitive",
      };
    }

    // Sanitize orderBy
    const safeOrderBy = orderBy?.createdAt
      ? { createdAt: orderBy.createdAt }
      : { createdAt: "desc" as const };

    // Execute query
    const [data, count] = await Promise.all([
      prisma.job.findMany({
        where: safeWhere,
        orderBy: safeOrderBy,
        skip,
        take: Math.min(take, 100), // Max 100 per query
      }),
      prisma.job.count({ where: safeWhere }),
    ]);

    return { data, count };
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
