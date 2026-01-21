/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  QueryObserverResult,
  RefetchOptions,
  QueryKey,
} from "@tanstack/react-query";
import { PAGE_SIZES } from "../constants/page-sizes";
import { AxiosError, type AxiosResponse } from "axios";
import type { PrismaQueryOptions } from "@/features/shared/types/prismaQuery.types";
import type { ApiFunctionForGen } from "@/features/shared/types/api.types";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import type { QueryKeyFactory } from "@/features/shared/types/queryKeys.types";

// Base props senza transformData
export interface UsePaginationForGenProps<T, TBody = any, TPath = any> {
  pageSize: number;
  initialPage?: number;
  prismaQuery?: PrismaQueryOptions<T>;
  enabled?: boolean;
  apiFunction: ApiFunctionForGen<any, TBody, TPath>;
  pathParams?: Record<string, any>; // Parametri per il path dell'API (es. { firmId, clientId })
  validateData?: (data: T[]) => boolean;
  onError?: (error: Error) => void;
  cacheDisabled?: boolean;
  skipDataLog?: boolean;
  /**
   * Query key factory function for generating cache keys
   * Replaces the old apiFunction.name pattern for more flexibility
   *
   * @example
   * queryKeyFactory: queryKeys.jobs.list
   */
  queryKeyFactory: QueryKeyFactory;
}

// Tipo restituito
export interface UsePaginationForGenReturn<T> {
  data: T[];
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<PaginatedResponse<T>, Error>>;
  nextPage: () => void;
  prevPage: () => void;
  handlePageClick: (page: number) => void;
  cacheDisabled?: boolean;
  /**
   * Query key for this specific query (with params)
   * Use for targeted invalidation of this exact query
   *
   * @example
   * queryClient.invalidateQueries({ queryKey })
   *
   * @example
   * // To invalidate all variants, use the factory without params:
   * queryClient.invalidateQueries({ queryKey: queryKeys.jobs.list() })
   */
  queryKey: QueryKey;
}

/**
 * Hook per la paginazione generica che gestisce automaticamente i parametri take/skip di Prisma.
 *
 * @template T - Tipo degli elementi nella lista
 * @template TBody - Tipo del body della richiesta API
 *
 * @param props - Configurazione dell'hook
 * @param props.pageSize - Numero di elementi per pagina (default: PAGINATION_CONSTANTS.DEFAULT_PAGE_SIZE)
 * @param props.initialPage - Pagina iniziale (default: 1)
 * @param props.prismaQuery - Query Prisma opzionale. Se si includono `take` e `skip` in questa query,
 *                           l'hook utilizzerà questi valori invece di quelli calcolati automaticamente.
 *                           Questo è utile per ottenere liste fisse di elementi (es. solo i primi 5 elementi)
 *                           senza navigazione, oppure per override specifici della paginazione.
 * @param props.enabled - Se la query deve essere eseguita (default: true)
 * @param props.apiFunction - Funzione API che accetta un body con i parametri di paginazione
 * @param props.validateData - Funzione opzionale per validare i dati ricevuti
 * @param props.onError - Callback opzionale per gestire gli errori
 * @param props.cacheDisabled - Se disabilitare la cache (default: false)
 *
 * @returns Oggetto con dati, stato di caricamento, controlli di paginazione e metadati
 *
 * @example
 * // Navigazione completa con paginazione automatica
 * const { data, currentPage, totalPages, nextPage, prevPage } = usePaginationForGen({
 *   pageSize: 10,
 *   apiFunction: getCustomers,
 *   prismaQuery: {
 *     where: { status: 'active' },
 *     orderBy: { createdAt: 'desc' }
 *   }
 * });
 *
 * @example
 * // Lista fissa di elementi senza navigazione (take/skip sovrascrivono pageSize)
 * const { data } = usePaginationForGen({
 *   pageSize: 10, // Questo viene ignorato
 *   apiFunction: getCustomers,
 *   prismaQuery: {
 *     take: 5,     // Questo sovrascrive pageSize
 *     skip: 0,
 *     where: { status: 'active' }
 *   }
 * });
 *
 */

export function usePaginationForGen<T, TBody = any, TPath = any>({
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  initialPage = 1,
  prismaQuery,
  enabled = true,
  apiFunction,
  pathParams,
  validateData,
  onError,
  cacheDisabled = false,
  skipDataLog = true,
  queryKeyFactory,
}: UsePaginationForGenProps<T, TBody>): UsePaginationForGenReturn<T> {
  const [skip, setSkip] = useState<number>((initialPage - 1) * pageSize);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);

  const currentPage = useMemo(() => {
    return Math.floor(skip / pageSize) + 1;
  }, [skip, pageSize]);

  // Crea il body completo per la funzione API
  const requestBody = useMemo(() => {
    const baseBody = {
      take: pageSize,
      skip,
      ...prismaQuery,
    };

    return {
      ...baseBody,
    } as TBody;
  }, [pageSize, skip, prismaQuery]);

  const requestPath = useMemo(() => {
    return {
      ...pathParams,
    } as TPath;
  }, [pathParams]);

  // Crea le options per la funzione API
  const queryOptions = useMemo(() => {
    return {
      body: requestBody,
      path: requestPath,
    };
  }, [requestBody, requestPath]);

  // Query key per questa specifica query (con body e path params)
  const queryKey: QueryKey = useMemo(
    () =>
      queryKeyFactory({
        body: requestBody as Record<string, unknown>,
        path: requestPath as Record<string, unknown>,
      }),
    [queryKeyFactory, requestBody, requestPath],
  );

  const {
    data: response,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async () => {
      // apiFunction returns AxiosResponse<PaginatedResponse<T>>
      // We need to extract response.data to get PaginatedResponse
      const response: AxiosResponse<PaginatedResponse<T>> | AxiosError =
        await apiFunction(queryOptions);

      if (response instanceof AxiosError) {
        throw response;
      }

      if (!skipDataLog) {
        console.log(`${apiFunction.name}:`, response.data?.data);
      }

      if (validateData && !validateData(response.data.data)) {
        console.error(
          `usePagination - Validation failed for ${apiFunction.name}, input data:`,
          response.data,
        );
        throw new Error(
          `Validation failed, ListType: ${
            apiFunction.name
          }, input data: ${JSON.stringify(response.data.data)}`,
        );
      }

      // Return PaginatedResponse (response.data)
      return response.data;
    },
    enabled,
    ...(cacheDisabled && {
      staleTime: 0,
    }),
  });

  const nextPage = useCallback(() => {
    if (currentPage === totalPages) return;
    setSkip((prev) => prev + pageSize);
  }, [currentPage, totalPages, pageSize]);

  const prevPage = useCallback(() => {
    if (currentPage === 1) return;
    setSkip((prev) => prev - pageSize);
  }, [currentPage, pageSize]);

  const handlePageClick = useCallback(
    (page: number) => {
      if (!skipDataLog) {
        console.log("Page clicked:", page);
      }
      setSkip((page - 1) * pageSize);
    },
    [pageSize, skipDataLog],
  );

  // Reset skip to 0 (page 1) when pageSize changes
  useEffect(() => {
    setSkip(0);
  }, [pageSize]);

  useEffect(() => {
    // Se non abbiamo dati, non fare nulla
    if (!response && totalItems === 0) return;

    const count = response?.count ?? totalItems;
    const newTotalPages = Math.ceil(count / pageSize);

    // Aggiorna totalItems solo se abbiamo response e il valore è cambiato
    if (response && response.count !== totalItems) {
      setTotalItems(response.count);
    }

    // Aggiorna totalPages se è cambiato
    if (newTotalPages !== totalPages) {
      setTotalPages(newTotalPages);
    }
  }, [response, pageSize, totalItems, totalPages]);

  useEffect(() => {
    if (isError && error && onError) {
      onError(error);
    }
  }, [isError, error, onError]);

  return {
    data: response?.data ?? [],
    isLoading,
    isFetching,
    isError,
    error,
    currentPage,
    totalPages,
    totalItems,
    refetch,
    nextPage,
    prevPage,
    handlePageClick,
    queryKey,
  };
}
