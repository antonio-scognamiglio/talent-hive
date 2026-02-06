import { useApplicationStats } from "./useApplicationStats";
import { getApplicationStatusLabel } from "../utils/status.utils";

interface UseApplicationStatusCountersProps {
  /**
   * Optional job ID to filter stats
   * If provided, shows stats only for that job
   * If omitted, shows global stats
   */
  jobId?: string;
}

/**
 * Hook per generare array di badge text dai contatori di workflow status.
 * Pensato per essere usato con ContentCard tramite prop `badgeText`.
 *
 * Durante il loading ritorna `undefined`, ContentCard nasconderà i badge automaticamente.
 *
 * @example
 * ```tsx
 * const badgeTexts = useApplicationStatusCounters({ jobId });
 *
 * <ContentCard badgeText={badgeTexts}>
 *   <CustomTable ... />
 * </ContentCard>
 * ```
 */
export function useApplicationStatusCounters({
  jobId,
}: UseApplicationStatusCountersProps = {}): string[] | undefined {
  const { data: stats, isLoading } = useApplicationStats({ jobId });

  // Durante il loading, non mostriamo badge (ContentCard gestisce l'assenza)
  if (isLoading || !stats) {
    return undefined;
  }

  // Mappa i dati in formato badge: "Label: count"
  // Filtra quelli con count > 0
  return stats
    .filter((stat) => stat.count > 0)
    .map((stat) => `${getApplicationStatusLabel(stat.status)}: ${stat.count}`);
}
