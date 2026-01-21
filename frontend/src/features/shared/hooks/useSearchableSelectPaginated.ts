/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useSearchableSelectPaginated Hook
 *
 * Hook che combina paginazione e ricerca lato server (Prisma).
 * Ideale per dataset con più di 200 elementi.
 *
 * ## Caratteristiche
 *
 * - **Lista iniziale paginata**: Mostra risultati pagina per pagina (pageSize: 24 di default)
 * - **Scroll infinito**: Carica automaticamente più risultati quando si scrolla alla fine
 * - **Ricerca lato server**: Ogni ricerca fa una chiamata API indipendente
 * - **Due modalità**: Lista paginata (senza query) vs Ricerca (con query)
 *
 * ## Configurazione
 *
 * Configura due set di query options separate:
 *
 * ```typescript
 * const config: UseSearchableSelectPaginatedConfig<City> = {
 *   apiFunction: citySearchCities,
 *   searchFields: ["name", "postalCode"],
 *   // Query per la lista iniziale (pagina per pagina)
 *   paginationQueryOptions: {
 *     include: { province: true },
 *     orderBy: { name: "asc" },
 *   },
 *   // Query per la ricerca (limite 200)
 *   searchQueryOptions: {
 *     take: 200, // Limita i risultati della ricerca
 *     include: { province: true },
 *     orderBy: { name: "asc" },
 *   },
 *   pageSize: 24, // Dimensione pagina per la lista iniziale
 * };
 * ```
 *
 * ## Comportamento
 *
 * ### Senza query (lista iniziale)
 * - Mostra `paginationQuery.allData` (risultati paginati)
 * - Scroll infinito: quando si scrolla alla fine, chiama `loadMore()`
 * - I dati vengono fetchati pagina per pagina (pageSize elementi)
 *
 * ### Con query (ricerca)
 * - Mostra `searchResults` (risultati ricerca)
 * - La ricerca usa `searchQueryOptions` con `take: 200`
 * - **Importante**: La ricerca è indipendente dalla lista iniziale
 * - Se ci sono più di 200 elementi totali, la ricerca può trovare elementi
 *   esclusi dalla lista iniziale (perché la lista iniziale è paginata, la ricerca no)
 *
 * ## Esempio Pratico
 *
 * Supponiamo di avere 500 città:
 * - **Lista iniziale**: Mostra le prime 24 città (page 1)
 * - **Scroll**: Carica altre 24 città (page 2), poi altre 24 (page 3), ecc.
 * - **Ricerca "Roma"**: Fa una chiamata API con `take: 200` e può trovare "Roma"
 *   anche se non era nelle prime pagine della lista iniziale
 *
 * @see useSearchableSelect Per dataset limitati (~200 elementi) senza lista iniziale (di default)
 */

import { useMemo } from "react";
import { usePaginationForGenWithState } from "@/features/pagination";
import {
  useSearchableSelect,
  type SearchableSelectConfig,
  type UseSearchableSelectReturn,
} from "@/features/shared/hooks/useSearchableSelect";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import { PAGE_SIZES } from "@/features/pagination/constants/page-sizes";
import type { QueryKeyFactory } from "@/features/shared/types/queryKeys.types";

export interface UseSearchableSelectPaginatedConfig<
  TApi,
  TFormatted = TApi,
  TBody = any,
  TPath = any,
> extends Omit<
  SearchableSelectConfig<TApi, TFormatted, TBody, TPath>,
  "queryOptions"
> {
  // Query options per la paginazione (lista generale, quando non c'è ricerca)
  paginationQueryOptions?: PrismaQueryOptions<TApi>;
  // Query options per la ricerca (quando c'è una query)
  searchQueryOptions?: PrismaQueryOptions<TApi>;
  // Page size per la paginazione
  pageSize?: number;
  queryKeyFactory: QueryKeyFactory;
}

export interface UseSearchableSelectPaginatedReturn<
  TApi,
  TFormatted = TApi,
> extends UseSearchableSelectReturn<TApi, TFormatted> {
  // Risultati da mostrare (paginati o ricerca)
  displayResults: TApi[];
  // Stato di loading (iniziale o ricerca)
  isLoading: boolean;
  // Stato di loading per loadMore
  isLoadingMore: boolean;
  // Se possiamo caricare più risultati
  canLoadMore: boolean;
  // Funzione per caricare più risultati
  loadMore: () => Promise<void>;
  // Errori dalla paginazione
  isError: boolean;
  error: Error | null;
  // Metadati dalla paginazione
  totalItems: number;
}

/**
 * Hook che combina paginazione e ricerca per SearchableSelect.
 *
 * Quando non c'è query, mostra risultati paginati.
 * Quando c'è query, mostra risultati ricerca.
 *
 * @example
 * const {
 *   displayResults,
 *   query,
 *   setQuery,
 *   isLoading,
 *   isLoadingMore,
 *   canLoadMore,
 *   loadMore,
 *   onSelect,
 *   onClear,
 * } = useSearchableSelectPaginated({
 *   apiFunction: citySearchCities,
 *   searchFields: ["name"],
 *   queryOptions: { orderBy: { name: "asc" } },
 *   pageSize: 24,
 * });
 */
export function useSearchableSelectPaginated<
  TApi,
  TFormatted = TApi,
  TBody = any,
  TPath = any,
>({
  apiFunction,
  searchFields,
  paginationQueryOptions,
  searchQueryOptions,
  pathParams,
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  orConditions,
  debounceMs,
  initialItem,
  onSelect: onSelectConfig,
  onClear: onClearConfig,
  splitSearchTerms,
  format,
  queryKeyFactory,
}: UseSearchableSelectPaginatedConfig<
  TApi,
  TFormatted,
  TBody,
  TPath
>): UseSearchableSelectPaginatedReturn<TApi, TFormatted> {
  // Configurazione per la ricerca (usa searchQueryOptions)
  const searchConfig: SearchableSelectConfig<TApi, TFormatted, TBody, TPath> =
    useMemo(
      () => ({
        apiFunction,
        searchFields,
        queryOptions: searchQueryOptions, // Query options specifiche per la ricerca
        pathParams,
        orConditions,
        debounceMs,
        initialItem,
        onSelect: onSelectConfig,
        onClear: onClearConfig,
        splitSearchTerms,
        format,
      }),
      [
        apiFunction,
        searchFields,
        searchQueryOptions,
        pathParams,
        orConditions,
        debounceMs,
        initialItem,
        onSelectConfig,
        onClearConfig,
        splitSearchTerms,
        format,
      ],
    );

  // Hook per ricerca (gestisce la query internamente)
  const {
    selectedItem,
    query,
    setQuery,
    results: searchResults,
    isSearching,
    onSelect,
    onClear,
  } = useSearchableSelect<TApi, TFormatted>(searchConfig);

  // Hook per paginazione (quando non c'è query, usa paginationQueryOptions)
  const paginationQuery = usePaginationForGenWithState<TApi, TBody, TPath>({
    pageSize,
    apiFunction,
    pathParams,
    prismaQuery: paginationQueryOptions, // Query options specifiche per la paginazione
    enabled: !query.trim(), // Disabilita quando c'è una query (usa ricerca invece)
    queryKeyFactory,
  });

  // Determina cosa mostrare: risultati ricerca o risultati paginati
  const displayResults = useMemo(() => {
    if (query.trim()) {
      return searchResults;
    }
    return paginationQuery.allData;
  }, [query, searchResults, paginationQuery.allData]);

  // Determina lo stato di loading
  const isLoading = useMemo(() => {
    if (query.trim()) {
      return isSearching;
    }
    return paginationQuery.isLoading;
  }, [query, isSearching, paginationQuery.isLoading]);

  // Determina se stiamo caricando più risultati (loadMore)
  const isLoadingMore = useMemo(() => {
    if (query.trim()) {
      return false; // Non c'è loadMore durante la ricerca
    }
    return paginationQuery.isLoadingMore;
  }, [query, paginationQuery.isLoadingMore]);

  // Determina se possiamo caricare più risultati
  const canLoadMore = useMemo(() => {
    if (query.trim()) {
      return false; // Non c'è loadMore durante la ricerca
    }
    return paginationQuery.canLoadMore;
  }, [query, paginationQuery.canLoadMore]);

  return {
    selectedItem,
    query,
    setQuery,
    results: searchResults, // Manteniamo per compatibilità, ma usare displayResults
    isSearching,
    onSelect,
    onClear,
    // Nuove proprietà
    displayResults,
    isLoading,
    isLoadingMore,
    canLoadMore,
    loadMore: paginationQuery.loadMore,
    // Errori dalla paginazione
    isError: paginationQuery.isError,
    error: paginationQuery.error,
    // Metadati dalla paginazione
    totalItems: paginationQuery.totalItems,
  };
}
