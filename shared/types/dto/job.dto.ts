import type { JobStatus } from "../entities/generated/interfaces";

/**
 * DTO for creating a new job
 */
export interface CreateJobDto {
  title: string;
  description: string;
  location?: string;
  salaryRange?: string;
}

/**
 * DTO for updating an existing job
 */
export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: JobStatus;
}

/**
 * DTO for listing/filtering jobs
 */
export interface ListJobsDto {
  skip?: number;
  take?: number;
  [key: string]: any; // Supports all Prisma query options (where, orderBy, include, select, etc.)
}
