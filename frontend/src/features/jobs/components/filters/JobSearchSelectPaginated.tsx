import { useMemo } from "react";
import { SearchableSelectPaginated } from "@/features/shared/components/search-selects/SearchableSelectPaginated";
import {
  useSearchableSelectPaginated,
  type UseSearchableSelectPaginatedConfig,
} from "@/features/shared/hooks/useSearchableSelectPaginated";
import { jobsService } from "@/features/shared/services/jobs.service";
import type { Job } from "@shared/types";
import { queryKeys } from "@/features/shared/config/query-client.config";

export interface JobSearchSelectPaginatedProps {
  value?: string;
  onChange: (jobId: string | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

/**
 * JobSearchSelectPaginated Component
 *
 * Componente per selezionare un job con ricerca e paginazione automatica.
 * Utilizz SearchableSelectPaginated per permettere la ricerca e lo scroll infinito.
 * Parte con risultati già fetchati, consente la ricerca e si aggiorna scrollando.
 *
 * Pattern: {Entity}SearchSelectPaginated (paginato, standalone - non form field)
 *
 * @example
 * ```tsx
 * <JobSearchSelectPaginated
 *   value={jobId}
 *   onChange={handleJobChange}
 *   placeholder="Filtra per job..."
 * />
 * ```
 */
export function JobSearchSelectPaginated({
  value,
  onChange,
  disabled = false,
  placeholder = "Seleziona job...",
  className,
}: JobSearchSelectPaginatedProps) {
  // Configurazione per la paginazione (lista generale)
  const paginationQueryOptions = useMemo(
    () => ({
      select: {
        id: true as const,
        title: true as const,
        location: true as const,
        status: true as const,
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    }),
    [],
  );

  // Configurazione per la ricerca
  const searchQueryOptions = useMemo(
    () => ({
      take: 200, // Limita i risultati della ricerca
      select: {
        id: true as const,
        title: true as const,
        location: true as const,
        status: true as const,
      },
      orderBy: {
        createdAt: "desc" as const,
      },
    }),
    [],
  );

  // Configurazione per l'hook
  const config: UseSearchableSelectPaginatedConfig<Job> = useMemo(
    () => ({
      apiFunction: jobsService.listJobs,
      searchFields: ["title", "location"],
      paginationQueryOptions,
      searchQueryOptions,
      pageSize: 24,
      queryKeyFactory: queryKeys.jobs.list,
    }),
    [paginationQueryOptions, searchQueryOptions],
  );

  // Hook che gestisce tutta la logica
  const {
    selectedItem,
    query,
    setQuery,
    displayResults,
    isLoading,
    isLoadingMore,
    canLoadMore,
    loadMore,
    onSelect: hookOnSelect,
    onClear: hookOnClear,
    isError,
    error,
    totalItems,
  } = useSearchableSelectPaginated<Job>(config);

  // Trova il job selezionato per il display
  const selectedJob = useMemo(() => {
    if (value) {
      return displayResults.find((job) => job.id === value) || selectedItem;
    }
    return selectedItem;
  }, [value, selectedItem, displayResults]);

  // Gestisce la selezione
  const handleSelect = (job: Job) => {
    hookOnSelect(job);
    onChange(job.id);
  };

  const handleClear = () => {
    hookOnClear();
    onChange(undefined);
  };

  const getJobName = (job: Job): string => {
    return `${job.title}${job.location ? ` · ${job.location}` : ""}`;
  };

  return (
    <SearchableSelectPaginated<Job>
      // Props dall'hook
      selectedItem={selectedJob}
      query={query}
      setQuery={setQuery}
      displayResults={displayResults}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      canLoadMore={canLoadMore}
      loadMore={loadMore}
      results={displayResults}
      isSearching={isLoading && query.trim() !== ""}
      isError={isError}
      error={error}
      totalItems={totalItems}
      // Handlers
      onSelect={handleSelect}
      onClear={handleClear}
      // Props per form integration
      value={value}
      onChange={onChange}
      getItemId={(job) => job.id}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      displayFormatter={(item) => {
        if (typeof item === "object" && item !== null && "title" in item) {
          return getJobName(item as Job);
        }
        return String(item);
      }}
      renderItem={(job) => (
        <div className="flex flex-col px-1">
          <span className="font-medium">{job.title}</span>
          {job.location && (
            <span className="text-xs text-muted-foreground">
              {job.location}
            </span>
          )}
        </div>
      )}
      emptyMessage="Nessun job trovato"
      loadingMoreMessage="Caricando altri job..."
    />
  );
}
