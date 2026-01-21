import { prisma } from "../libs/prisma";
import type { Job, JobStatus, Prisma } from "@prisma/client";
import type {
  CreateJobDto,
  UpdateJobDto,
  ListJobsDto,
  UserWithoutPassword,
} from "@shared/types";
import type { PaginatedResponse } from "../types/pagination.types";
import { sanitizePrismaQuery } from "../utils/sanitize-prisma-query.util";
import {
  addORConstraints,
  setQueryDefaults,
} from "../utils/prisma-query.utils";

class JobService {
  /**
   * Get jobs list with pagination and filters
   * RBAC: CANDIDATE sees only PUBLISHED, RECRUITER/ADMIN see all
   */
  async getJobs(
    incomingQuery: ListJobsDto,
    user: UserWithoutPassword,
  ): Promise<PaginatedResponse<Job>> {
    // Sanitize entire query: limits include depth + caps pagination
    let safeQuery: Prisma.JobFindManyArgs = sanitizePrismaQuery(incomingQuery, {
      maxIncludeDepth: 1,
      maxTake: 100,
    });

    const where = safeQuery.where || {};

    // RBAC: Override where clause based on role
    if (user.role === "CANDIDATE") {
      // CANDIDATE: Force PUBLISHED status
      safeQuery.where = { ...where, status: "PUBLISHED" };
    } else if (user.role === "RECRUITER") {
      // RECRUITER: PUBLISHED jobs OR own jobs
      // Use utility to intelligently combine with existing filters
      safeQuery.where = addORConstraints(where, [
        { status: "PUBLISHED" },
        { createdById: user.id },
      ]);
    }
    // ADMIN: No restrictions

    // Set defaults using utility
    safeQuery = setQueryDefaults(safeQuery, {
      skip: 0,
      take: 10,
      orderBy: { createdAt: "desc" as const },
    });

    // Execute query
    const [data, count] = await Promise.all([
      prisma.job.findMany(safeQuery),
      prisma.job.count({ where: safeQuery.where }),
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
    user: UserWithoutPassword,
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
