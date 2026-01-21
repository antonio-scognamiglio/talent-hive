/**
 * Job Status Utilities
 *
 * Utility functions and constants for job status badges and colors
 */

import type { JobStatus } from "@shared/types";

/**
 * Labels for job status
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
} as const;

/**
 * Colors for job status badges (Tailwind classes with dark mode support)
 */
export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  DRAFT:
    "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  PUBLISHED:
    "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  ARCHIVED:
    "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
} as const;

/**
 * Gets the CSS classes for a job status badge
 */
export function getJobStatusBadgeClasses(status: JobStatus): string {
  return JOB_STATUS_COLORS[status] || JOB_STATUS_COLORS.DRAFT;
}
