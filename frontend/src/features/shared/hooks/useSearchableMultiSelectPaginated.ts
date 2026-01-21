/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useSearchableMultiSelectPaginated Hook
 *
 * Hook che combina paginazione e ricerca lato server (Prisma) per selezione multipla.
 * Ideale per dataset con più di 200 elementi quando serve selezionare più elementi.
 *
 * ## Caratteristiche
 *
 * - **Selezione multipla**: Gestisce array di ID (`selectedIds: string[]`)
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
 * const config: UseSearchableMultiSelectPaginatedConfig<Expertise> = {
 *   apiFunction: expertiseSearchExpertises,
 *   searchFields: ["name", "description"],
 *   // Query per la lista iniziale (pagina per pagina)
 *   paginationQueryOptions: {
 *     orderBy: { name: "asc" },
 *   },
 *   // Query per la ricerca (limite 200)
 *   searchQueryOptions: {
 *     take: 200, // Limita i risultati della ricerca
 *     orderBy: { name: "asc" },
 *   },
 *   pageSize: 24, // Dimensione pagina per la lista iniziale
 *   initialSelectedIds: ["id1", "id2"], // ID iniziali selezionati (opzionale)
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
 * ### Selezione multipla
 * - `onToggle(item)` aggiunge/rimuove l'elemento dalla selezione
 * - `selectedIds` contiene gli ID degli elementi selezionati
 * - `selectedItems` contiene gli oggetti completi degli elementi selezionati
 *
 * ## Esempio Pratico
 *
 * Supponiamo di avere 500 specializzazioni:
 * - **Lista iniziale**: Mostra le prime 24 specializzazioni (page 1)
 * - **Scroll**: Carica altre 24 specializzazioni (page 2), poi altre 24 (page 3), ecc.
 * - **Ricerca "Diritto"**: Fa una chiamata API con `take: 200` e può trovare specializzazioni
 *   anche se non erano nelle prime pagine della lista iniziale
 * - **Selezione**: L'utente può selezionare più specializzazioni, che vengono mostrate come badge
 *
 * @see useSearchableSelectPaginated Per selezione singola con ricerca e paginazione
 * @see MultiSelect Per selezione multipla con ricerca lato client (array già caricato)
 */

import { useMemo, useState, useCallback, useEffect } from "react";
import { usePaginationForGenWithState } from "@/features/pagination/hooks";
import {
  useSearchableSelect,
  type SearchableSelectConfig,
} from "@/features/shared/hooks/useSearchableSelect";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import { PAGE_SIZES } from "@/features/pagination/constants";
import type { QueryKeyFactory } from "@/features/shared/types/queryKeys.types";

export interface UseSearchableMultiSelectPaginatedConfig<
  TApi,
  TBody = any,
  TPath = any,
> extends Omit<
  SearchableSelectConfig<TApi, TApi, TBody, TPath>,
  "queryOptions" | "initialItem" | "onSelect" | "onClear"
> {
  // Query options per la paginazione (lista generale, quando non c'è ricerca)
  paginationQueryOptions?: PrismaQueryOptions<TApi>;
  // Query options per la ricerca (quando c'è una query)
  searchQueryOptions?: PrismaQueryOptions<TApi>;
  // Page size per la paginazione
  pageSize?: number;
  queryKeyFactory: QueryKeyFactory;
  // ID iniziali selezionati
  initialSelectedIds?: string[];
  // Callback quando la selezione cambia
  onSelectionChange?: (selectedIds: string[]) => void;
  // Funzione per estrarre l'ID da un item
  getItemId: (item: TApi) => string;
}

export interface UseSearchableMultiSelectPaginatedReturn<TApi> {
  // ID selezionati
  selectedIds: string[];
  // Items selezionati completi (ricavati da selectedIds)
  selectedItems: TApi[];
  // Query di ricerca
  query: string;
  setQuery: (query: string) => void;
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
  // Funzione per toggle selezione (aggiunge/rimuove)
  onToggle: (item: TApi) => void;
  // Funzione per rimuovere un ID dalla selezione
  onRemove: (id: string) => void;
  // Funzione per pulire tutta la selezione
  onClear: () => void;
  // Errori dalla paginazione
  isError: boolean;
  error: Error | null;
  // Metadati dalla paginazione
  totalItems: number;
  // Stato di ricerca (per compatibilità con useSearchableSelect)
  isSearching: boolean;
}

/**
 * Hook che combina paginazione e ricerca per MultiSelect con selezione multipla.
 *
 * Quando non c'è query, mostra risultati paginati.
 * Quando c'è query, mostra risultati ricerca.
 * Gestisce selezione multipla con array di ID.
 *
 * @example
 * const {
 *   selectedIds,
 *   selectedItems,
 *   displayResults,
 *   query,
 *   setQuery,
 *   isLoading,
 *   isLoadingMore,
 *   canLoadMore,
 *   loadMore,
 *   onToggle,
 *   onRemove,
 *   onClear,
 * } = useSearchableMultiSelectPaginated({
 *   apiFunction: expertiseSearchExpertises,
 *   searchFields: ["name"],
 *   getItemId: (e) => e.id,
 *   paginationQueryOptions: { orderBy: { name: "asc" } },
 *   searchQueryOptions: { take: 200 },
 *   pageSize: 24,
 * });
 */
export function useSearchableMultiSelectPaginated<
  TApi,
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
  splitSearchTerms,
  format,
  queryKeyFactory,
  initialSelectedIds = [],
  onSelectionChange,
  getItemId,
}: UseSearchableMultiSelectPaginatedConfig<
  TApi,
  TBody,
  TPath
>): UseSearchableMultiSelectPaginatedReturn<TApi> {
  // Stato per gli ID selezionati
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);

  // Sincronizza selectedIds quando initialSelectedIds cambia esternamente
  useEffect(() => {
    setSelectedIds(initialSelectedIds);
  }, [initialSelectedIds]);

  // Configurazione per la ricerca (usa searchQueryOptions)
  const searchConfig: SearchableSelectConfig<TApi, TApi, TBody, TPath> =
    useMemo(
      () => ({
        apiFunction,
        searchFields,
        queryOptions: searchQueryOptions, // Query options specifiche per la ricerca
        pathParams,
        orConditions,
        debounceMs,
        splitSearchTerms,
        format,
        // Non usiamo onSelect/onClear perché gestiamo la selezione multipla manualmente
      }),
      [
        apiFunction,
        searchFields,
        searchQueryOptions,
        pathParams,
        orConditions,
        debounceMs,
        splitSearchTerms,
        format,
      ],
    );

  // Hook per ricerca (gestisce la query internamente)
  const {
    query,
    setQuery,
    results: searchResults,
    isSearching,
  } = useSearchableSelect<TApi, TApi>(searchConfig);

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

  // Cache per mantenere gli items selezionati anche se non sono nei displayResults
  const [selectedItemsCache, setSelectedItemsCache] = useState<
    Map<string, TApi>
  >(new Map());

  // Aggiorna la cache quando displayResults cambia (aggiunge nuovi items trovati)
  useEffect(() => {
    setSelectedItemsCache((prev) => {
      const newCache = new Map(prev);
      displayResults.forEach((item) => {
        const id = getItemId(item);
        // Aggiorna solo se l'item è selezionato o se non è già in cache
        if (selectedIds.includes(id) || !newCache.has(id)) {
          newCache.set(id, item);
        }
      });
      return newCache;
    });
  }, [displayResults, selectedIds, getItemId]);

  // Items selezionati completi (dalla cache)
  const selectedItems = useMemo(() => {
    return selectedIds
      .map((id) => selectedItemsCache.get(id))
      .filter(Boolean) as TApi[];
  }, [selectedIds, selectedItemsCache]);

  // Funzione per toggle selezione (aggiunge se non presente, rimuove se presente)
  const onToggle = useCallback(
    (item: TApi) => {
      const id = getItemId(item);
      setSelectedIds((prev) => {
        const newIds = prev.includes(id)
          ? prev.filter((x) => x !== id)
          : [...prev, id];
        if (onSelectionChange) {
          onSelectionChange(newIds);
        }
        return newIds;
      });
      // Aggiorna la cache con l'item selezionato
      setSelectedItemsCache((prev) => {
        const newCache = new Map(prev);
        newCache.set(id, item);
        return newCache;
      });
    },
    [getItemId, onSelectionChange],
  );

  // Funzione per rimuovere un ID dalla selezione
  const onRemove = useCallback(
    (id: string) => {
      setSelectedIds((prev) => {
        const newIds = prev.filter((x) => x !== id);
        if (onSelectionChange) {
          onSelectionChange(newIds);
        }
        return newIds;
      });
    },
    [onSelectionChange],
  );

  // Funzione per pulire tutta la selezione
  const onClear = useCallback(() => {
    setSelectedIds([]);
    if (onSelectionChange) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  return {
    selectedIds,
    selectedItems,
    query,
    setQuery,
    displayResults,
    isLoading,
    isLoadingMore,
    canLoadMore,
    loadMore: paginationQuery.loadMore,
    onToggle,
    onRemove,
    onClear,
    // Errori dalla paginazione
    isError: paginationQuery.isError,
    error: paginationQuery.error,
    // Metadati dalla paginazione
    totalItems: paginationQuery.totalItems,
    // Stato di ricerca
    isSearching,
  };
}
