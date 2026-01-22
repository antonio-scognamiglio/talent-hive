import type { JobStatus } from "../entities/generated/interfaces";
import type { BaseListDto } from "./common.dto";

/**
 * DTO for creating a new job
 */
export interface CreateJobDto {
  title: string;
  description: string;
  location?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}

/**
 * DTO for updating an existing job
 */
export interface UpdateJobDto extends Partial<CreateJobDto> {
  status?: JobStatus;
}

/**
 * DTO for listing/filtering jobs
 * Extends universal BaseListDto for flexibility
 */
export interface ListJobsDto extends BaseListDto {}
