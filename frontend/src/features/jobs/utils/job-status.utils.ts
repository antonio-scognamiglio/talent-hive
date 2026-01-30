import type { JobStatus } from "@shared/types";

/**
 * Mappa degli stili per i badge di stato del Job
 */
export const JOB_STATUS_VARIANTS: Record<JobStatus, string> = {
  DRAFT:
    "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800",
  PUBLISHED:
    "bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  ARCHIVED:
    "bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
};

/**
 * Mappa delle etichette per i badge di stato del Job
 */
export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Bozza",
  PUBLISHED: "Pubblicato",
  ARCHIVED: "Archiviato",
};

/**
 * Restituisce le classi CSS per il badge dato lo stato
 */
export function getJobStatusVariant(status: string): string {
  return (
    JOB_STATUS_VARIANTS[status as JobStatus] || "bg-gray-100 text-gray-800"
  );
}

/**
 * Restituisce l'etichetta leggibile per lo stato
 */
export function getJobStatusLabel(status: string): string {
  return JOB_STATUS_LABELS[status as JobStatus] || status;
}
