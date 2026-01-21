import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import { apiClient } from "../api/client";
import type { Job, CreateJobDto, UpdateJobDto } from "@shared/types";
import type { AxiosResponse } from "axios";

/**
 * Jobs API Service
 * Handles all job-related API calls
 * Returns full AxiosResponse for access to headers, status, etc.
 */
export const jobsService = {
  /**
   * List jobs with pagination and filters
   * POST /api/jobs/list
   *
   * @param options - API options with body containing Prisma query
   * @returns Full AxiosResponse with PaginatedResponse in .data
   */
  listJobs: async (options: {
    body: PrismaQueryOptions<Job>;
    path?: Record<string, unknown>;
  }): Promise<AxiosResponse<PaginatedResponse<Job>>> => {
    return await apiClient.post<PaginatedResponse<Job>>(
      "/jobs/list",
      options.body,
    );
  },

  /**
   * Get single job by ID
   * GET /api/jobs/:id
   *
   * @param id - Job ID
   * @returns Full AxiosResponse with Job in .data
   */
  getJob: async (id: string): Promise<AxiosResponse<Job>> => {
    return await apiClient.get<Job>(`/jobs/${id}`);
  },

  /**
   * Create new job (RECRUITER/ADMIN only)
   * POST /api/jobs
   *
   * @param data - Job creation data
   * @returns Full AxiosResponse with created Job in .data
   */
  createJob: async (data: CreateJobDto): Promise<AxiosResponse<Job>> => {
    return await apiClient.post<Job>("/jobs", data);
  },

  /**
   * Update existing job (Owner or ADMIN only)
   * PATCH /api/jobs/:id
   *
   * @param id - Job ID
   * @param data - Job update data
   * @returns Full AxiosResponse with updated Job in .data
   */
  updateJob: async (
    id: string,
    data: UpdateJobDto,
  ): Promise<AxiosResponse<Job>> => {
    return await apiClient.patch<Job>(`/jobs/${id}`, data);
  },

  /**
   * Archive job (soft delete, Owner or ADMIN only)
   * DELETE /api/jobs/:id
   *
   * @param id - Job ID
   * @returns Full AxiosResponse with archived Job in .data
   */
  deleteJob: async (id: string): Promise<AxiosResponse<Job>> => {
    return await apiClient.delete<Job>(`/jobs/${id}`);
  },
};
