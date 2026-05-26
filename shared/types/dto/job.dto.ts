import type { JobStatus } from "../entities/generated/interfaces";
import type { BaseListDto } from "./common.dto";

/**
 * Shared job fields used by both Create and Update DTOs
 */
export interface BaseJobFields {
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}

/**
 * DTO for creating a new job
 */
export interface CreateJobDto extends BaseJobFields {
  status?: Extract<JobStatus, "DRAFT" | "PUBLISHED">;
}

/**
 * DTO for updating an existing job
 */
export interface UpdateJobDto extends Partial<BaseJobFields> {
  status?: JobStatus;
}

/**
 * DTO for listing/filtering jobs
 * Extends universal BaseListDto for flexibility
 */
export interface ListJobsDto extends BaseListDto {}
