import type { Job, Role } from "@shared/types";
import type { JobWithCount } from "@/features/jobs/types/job.types";

/**
 * Job Permissions Utilities
 *
 * Centralizza tutte le logiche di permesso relative ai Job.
 * Può essere usato ovunque: dialogs, columns.utils, pages, etc.
 *
 * Pattern: Pure functions che ricevono entity + context e ritornano boolean.
 */

interface UserContext {
  id: string;
  role: Role;
}

/**
 * Verifica se l'utente è il proprietario del job
 */
export function isJobOwner(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  return job.createdById === user.id;
}

/**
 * Verifica se l'utente può modificare il job
 *
 * Condizioni:
 * - L'utente è ADMIN (può modificare tutti i job)
 * - OPPURE l'utente è il creatore del job (owner)
 */
export function canEditJob(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  if (user.role === "ADMIN") return true;
  return isJobOwner(job, user);
}

/**
 * Alias per canEditJob - stessa logica per delete (soft delete)
 *
 * Condizioni:
 * - L'utente è ADMIN
 * - OPPURE l'utente è il creatore del job
 */
export function canDeleteJob(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  return canEditJob(job, user);
}

/**
 * Verifica se l'utente può vedere le candidature di un job
 *
 * Condizioni:
 * - L'utente è ADMIN (vede tutte le candidature)
 * - OPPURE l'utente è RECRUITER e proprietario del job
 *
 * Note: CANDIDATE non può vedere le candidature altrui
 */
export function canViewJobApplications(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role === "RECRUITER") return isJobOwner(job, user);
  return false;
}

/**
 * Verifica se l'utente può pubblicare il job
 *
 * Condizioni:
 * - L'utente può modificare il job (owner o admin)
 * - Il job è in stato DRAFT
 */
export function canPublishJob(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  return canEditJob(job, user) && job.status === "DRAFT";
}

/**
 * Verifica se l'utente può archiviare il job
 *
 * Condizioni:
 * - L'utente può modificare il job (owner o admin)
 * - Il job NON è già archiviato
 */
export function canArchiveJob(
  job: Job | JobWithCount,
  user: UserContext,
): boolean {
  return canEditJob(job, user) && job.status !== "ARCHIVED";
}

/**
 * Verifica se un CANDIDATE può candidarsi per questo job
 *
 * Condizioni:
 * - Il job è in stato PUBLISHED
 *
 * Note: Non controlla se ha già applicato (gestito altrove)
 */
export function canApplyToJob(job: Job | JobWithCount): boolean {
  return job.status === "PUBLISHED";
}

/**
 * Verifica se il job è visibile per il listing (marketplace candidati)
 *
 * Condizioni:
 * - Il job è in stato PUBLISHED
 */
export function isJobPublished(job: Job | JobWithCount): boolean {
  return job.status === "PUBLISHED";
}

/**
 * Verifica se il job è in stato bozza
 */
export function isJobDraft(job: Job | JobWithCount): boolean {
  return job.status === "DRAFT";
}

/**
 * Verifica se il job è archiviato
 */
export function isJobArchived(job: Job | JobWithCount): boolean {
  return job.status === "ARCHIVED";
}
