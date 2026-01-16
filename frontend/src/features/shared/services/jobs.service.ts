import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import { apiClient } from "../api/client";
import type { Job, CreateJobDto, UpdateJobDto } from "@shared/types";

/**
 * Jobs API Service
 * Handles all job-related API calls
 */
export const jobsService = {
  /**
   * List jobs with pagination and filters
   * POST /api/jobs/list
   *
   * @param options - API options with body containing Prisma query
   * @returns Paginated list of jobs
   */
  listJobs: async (options: {
    body: PrismaQueryOptions<Job>;
    path?: Record<string, unknown>;
  }): Promise<PaginatedResponse<Job>> => {
    const response = await apiClient.post<PaginatedResponse<Job>>(
      "/jobs/list",
      options.body
    );
    return response.data;
  },

  /**
   * Get single job by ID
   * GET /api/jobs/:id
   *
   * @param id - Job ID
   * @returns Job details
   */
  getJob: async (id: string): Promise<Job> => {
    const response = await apiClient.get<Job>(`/jobs/${id}`);
    return response.data;
  },

  /**
   * Create new job (RECRUITER/ADMIN only)
   * POST /api/jobs
   *
   * @param data - Job creation data
   * @returns Created job
   */
  createJob: async (data: CreateJobDto): Promise<Job> => {
    const response = await apiClient.post<Job>("/jobs", data);
    return response.data;
  },

  /**
   * Update existing job (Owner or ADMIN only)
   * PATCH /api/jobs/:id
   *
   * @param id - Job ID
   * @param data - Job update data
   * @returns Updated job
   */
  updateJob: async (id: string, data: UpdateJobDto): Promise<Job> => {
    const response = await apiClient.patch<Job>(`/jobs/${id}`, data);
    return response.data;
  },

  /**
   * Archive job (soft delete, Owner or ADMIN only)
   * DELETE /api/jobs/:id
   *
   * @param id - Job ID
   * @returns Archived job
   */
  deleteJob: async (id: string): Promise<Job> => {
    const response = await apiClient.delete<Job>(`/jobs/${id}`);
    return response.data;
  },
};
