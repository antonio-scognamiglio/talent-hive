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
};
