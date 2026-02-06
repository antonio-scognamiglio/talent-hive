import type { Application, ListApplicationsDto } from "@shared/types";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import { apiClient } from "../api/client";
import type { AxiosResponse } from "axios";

/**
 * Applications API Service
 * Handles all application-related API calls for candidates
 * Returns full AxiosResponse for compatibility with usePaginationForGen
 */
export const applicationsService = {
  /**
   * List applications with filters and pagination
   * POST /api/applications/list
   *
   * @param options - API options with body containing Prisma query
   * @returns Full AxiosResponse with PaginatedResponse in .data
   */
  listApplications: async (options: {
    body: ListApplicationsDto;
    path?: Record<string, unknown>;
  }): Promise<AxiosResponse<PaginatedResponse<Application>>> => {
    return await apiClient.post<PaginatedResponse<Application>>(
      "/applications/list",
      options.body,
    );
  },

  /**
   * Get candidate's own applications (Legacy/Simple version)
   * GET /api/applications/my
   *
   * @returns List of user's applications with job details
   */
  getMyApplications: async (): Promise<Application[]> => {
    const response = await apiClient.get<Application[]>("/applications/my");
    return response.data;
  },

  /**
   * Get single application by ID
   * GET /api/applications/:id
   *
   * @param id - Application ID
   * @returns Application details with job info
   */
  getApplication: async (id: string): Promise<Application> => {
    const response = await apiClient.get<Application>(`/applications/${id}`);
    return response.data;
  },

  /**
   * Apply to a job with CV upload
   * POST /api/applications
   *
   * @param jobId - Job to apply to
   * @param coverLetter - Optional cover letter
   * @param cvFile - CV PDF file
   * @returns Created application
   */
  createApplication: async (
    jobId: string,
    coverLetter: string | undefined,
    cvFile: File,
  ): Promise<Application> => {
    const formData = new FormData();
    formData.append("jobId", jobId);
    if (coverLetter) {
      formData.append("coverLetter", coverLetter);
    }
    formData.append("cv", cvFile);

    const response = await apiClient.post<Application>(
      "/applications",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );
    return response.data;
  },

  /**
   * Get presigned URL to download/preview CV
   * GET /api/applications/:id/cv
   *
   * @param applicationId - Application ID
   * @returns Presigned URL for CV access
   */
  getCvUrl: async (applicationId: string): Promise<string> => {
    const response = await apiClient.get<{ downloadUrl: string }>(
      `/applications/${applicationId}/cv`,
    );
    return response.data.downloadUrl;
  },

  /**
   * Get application statistics (counts by workflow status)
   * GET /api/applications/application-stats?jobId=xxx
   *
   * @param jobId - Optional job ID filter
   * @returns Array of status counts
   */
  getApplicationStats: async (
    jobId?: string,
  ): Promise<Array<{ status: string; count: number }>> => {
    const response = await apiClient.get<
      Array<{ status: string; count: number }>
    >("/applications/application-stats", {
      params: jobId && jobId.trim() !== "" ? { jobId } : undefined,
    });
    return response.data;
  },

  /**
   * Update workflow status (Kanban drag & drop)
   * PATCH /api/applications/:id/workflow
   *
   * @param id - Application ID
   * @param workflowStatus - New workflow status
   * @returns Updated application
   */
  updateWorkflowStatus: async (
    id: string,
    workflowStatus: string,
  ): Promise<Application> => {
    const response = await apiClient.patch<Application>(
      `/applications/${id}/workflow`,
      { workflowStatus },
    );
    return response.data;
  },

  /**
   * Hire candidate (final action)
   * POST /api/applications/:id/hire
   *
   * @param id - Application ID
   * @param data - Optional notes and score
   * @returns Updated application with HIRED status
   */
  hireCandidate: async (
    id: string,
    data?: { notes?: string; score?: number },
  ): Promise<Application> => {
    const response = await apiClient.post<Application>(
      `/applications/${id}/hire`,
      data || {},
    );
    return response.data;
  },

  /**
   * Reject candidate (final action)
   * POST /api/applications/:id/reject
   *
   * @param id - Application ID
   * @param data - Rejection details (reason, notes, score)
   * @returns Updated application with REJECTED status
   */
  rejectCandidate: async (
    id: string,
    data: { reason?: string; notes?: string; score?: number },
  ): Promise<Application> => {
    const response = await apiClient.post<Application>(
      `/applications/${id}/reject`,
      data,
    );
    return response.data;
  },

  /**
   * Update application (workflow status, notes, score)
   * PUT /api/applications/:id
   *
   * @param id - Application ID
   * @param data - { workflowStatus, notes, score }
   * @returns Updated application
   */
  updateApplication: async (
    id: string,
    data: {
      workflowStatus?: string;
      notes?: string;
      score?: number;
    },
  ): Promise<Application> => {
    const response = await apiClient.put<Application>(
      `/applications/${id}`,
      data,
    );
    return response.data;
  },
};
