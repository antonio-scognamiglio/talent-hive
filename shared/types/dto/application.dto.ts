/**
 * DTO for creating an application
 */
export interface CreateApplicationDto {
  jobId: string;
  coverLetter?: string;
}

/**
 * DTO for listing/filtering applications
 * Following Powergiob pattern: accepts any Prisma query fields
 */
export interface ListApplicationsDto {
  skip?: number;
  take?: number;
  [key: string]: any; // Supports all Prisma query options
}
