/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import type {
  QueryObserverResult,
  RefetchOptions,
  QueryKey,
} from "@tanstack/react-query";
import type { PaginatedResponse } from "@/features/shared/types/pagination.types";
import type { PrismaQueryOptions } from "../../shared/types/prismaQuery.types";
import { PAGE_SIZES } from "../constants/page-sizes";
import { AxiosError, type AxiosResponse } from "axios";
import type { ApiFunctionForGen } from "../../shared/types/api.types";
import type { QueryKeyFactory } from "../../shared/types/queryKeys.types";

// Base props
export interface UsePaginationForGenWithStateProps<
  T,
  TBody = any,
  TPath = any,
> {
  pageSize: number;
  initialPage?: number;
  prismaQuery?: PrismaQueryOptions<T>;
  enabled?: boolean;
  apiFunction: ApiFunctionForGen<any, TBody, TPath>;
  queryKeyFactory: QueryKeyFactory;
  pathParams?: Record<string, any>; // Parametri per il path dell'API (es. { firmId, clientId })
  validateData?: (data: T[]) => boolean;
  onError?: (error: Error) => void;
  cacheDisabled?: boolean;
  skipDataLog?: boolean;
  /**
   * Ordine di inserimento dei nuovi dati quando si fa loadMore.
   * - "desc" (default): aggiunge i nuovi dati alla fine dell'array (comportamento standard)
   * - "asc": aggiunge i nuovi dati all'inizio dell'array (utile per chat dove i vecchi messaggi vanno in alto)
   */
  loadMoreOrder?: "asc" | "desc";
}

// Tipo restituito
export interface UsePaginationForGenWithStateReturn<T> {
  // Tutti i dati accumulati (tutti i risultati caricati finora)
  allData: T[];
  // Dati dell'ultima pagina caricata (opzionale, utile per debug)
  currentPageData: T[];
  // Stato di caricamento iniziale (prima pagina)
  isLoading: boolean;
  // Stato di caricamento per loadMore (diverso da isLoading)
  isLoadingMore: boolean;
  isError: boolean;
  error: Error | null;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  refetch: (
    options?: RefetchOptions,
  ) => Promise<QueryObserverResult<PaginatedResponse<T>, Error>>;
  // Carica la pagina successiva e aggiunge i risultati ad allData
  loadMore: () => Promise<void>;
  // Indica se ci sono più risultati da caricare
  canLoadMore: boolean;
  // Resetta lo stato e ricarica dalla prima pagina
  reset: () => void;
  cacheDisabled?: boolean;
  /**
   * Query key completa per questa specifica query (con body e path params).
   * Usa questa query key per aggiornare la cache specifica invece di invalidare tutto.
   *
   * @example
   * // Invalidate specific page
   * queryClient.invalidateQueries({ queryKey })
   */
  queryKey: QueryKey;
  /**
   * Setter per aggiornare direttamente allData.
   * Permette aggiornamenti ottimistici dello stato interno senza refetch.
   */
  setAllData: React.Dispatch<React.SetStateAction<T[]>>;
}

/**
 * Hook per la paginazione con stato accumulato (infinite scroll / load more).
 * Mantiene tutti i risultati precedenti in memoria e permette di caricare più risultati
 * senza perdere quelli già caricati.
 *
 * @template T - Tipo degli elementi nella lista
 * @template TBody - Tipo del body della richiesta API
 *
 * @param props - Configurazione dell'hook
 * @param props.pageSize - Numero di elementi per pagina (default: PAGE_SIZES.DEFAULT_PAGE_SIZE)
 * @param props.initialPage - Pagina iniziale (default: 1)
 * @param props.prismaQuery - Query Prisma opzionale. NOTA: `take` e `skip` vengono ignorati
 *                           e gestiti automaticamente dall'hook.
 * @param props.enabled - Se la query deve essere eseguita (default: true)
 * @param props.apiFunction - Funzione API che accetta un body con i parametri di paginazione
 * @param props.validateData - Funzione opzionale per validare i dati ricevuti
 * @param props.onError - Callback opzionale per gestire gli errori
 * @param props.cacheDisabled - Se disabilitare la cache (default: false)
 *
 * @returns Oggetto con dati accumulati, stato di caricamento, loadMore e metadati
 *
 * @example
 * // Carica risultati con loadMore
 * const { allData, loadMore, canLoadMore, isLoadingMore } = usePaginationForGenWithState({
 *   pageSize: 24,
 *   apiFunction: caseSearchFirms,
 *   prismaQuery: {
 *     where: { status: 'active' },
 *     orderBy: { createdAt: 'desc' }
 *   }
 * });
 *
 * // Nel componente:
 * {allData.map(item => <Item key={item.id} {...item} />)}
 * {canLoadMore && (
 *   <Button onClick={loadMore} disabled={isLoadingMore}>
 *     {isLoadingMore ? 'Caricamento...' : 'Carica altri'}
 *   </Button>
 * )}
 */
export function usePaginationForGenWithState<T, TBody = any, TPath = any>({
  pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE,
  initialPage = 1,
  prismaQuery,
  enabled = true,
  apiFunction,
  pathParams,
  queryKeyFactory,
  validateData,
  onError,
  cacheDisabled = false,
  skipDataLog = true,
  loadMoreOrder = "desc", // Default: aggiungi alla fine
}: UsePaginationForGenWithStateProps<
  T,
  TBody
>): UsePaginationForGenWithStateReturn<T> {
  // Stato per tutti i dati accumulati
  const [allData, setAllData] = useState<T[]>([]);
  // Stato per i dati dell'ultima pagina caricata
  const [currentPageData, setCurrentPageData] = useState<T[]>([]);
  // Stato per skip (quanti elementi abbiamo già caricato)
  const [skip, setSkip] = useState<number>((initialPage - 1) * pageSize);
  // Stato per totalPages e totalItems
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  // Ref per tracciare quando abbiamo chiamato loadMore (previene chiamate multiple)
  const isLoadingMoreRef = useRef<boolean>(false);
  const previousSkipRef = useRef<number>((initialPage - 1) * pageSize);

  // Ref per tracciare i valori serializzati precedenti (evita serializzazioni ridondanti)
  const prismaQuerySerializedRef = useRef<string>("");
  const pathParamsSerializedRef = useRef<string>("");

  // Serializza prismaQuery e pathParams per confronto stabile (evita loop infiniti)
  // Usa useRef per evitare doppia serializzazione: serializza solo nel corpo, confronta con ref
  const prismaQuerySerialized = useMemo(() => {
    const current = JSON.stringify(prismaQuery || {});
    if (current !== prismaQuerySerializedRef.current) {
      prismaQuerySerializedRef.current = current;
    }
    return prismaQuerySerializedRef.current;
  }, [prismaQuery]);

  const pathParamsSerialized = useMemo(() => {
    const current = JSON.stringify(pathParams || {});
    if (current !== pathParamsSerializedRef.current) {
      pathParamsSerializedRef.current = current;
    }
    return pathParamsSerializedRef.current;
  }, [pathParams]);

  // Reset allData quando prismaQuery, pathParams o pageSize cambiano (sempre)
  useEffect(() => {
    setAllData([]);
    setCurrentPageData([]);
    const initialSkip = (initialPage - 1) * pageSize;
    setSkip(initialSkip);
    setTotalPages(0);
    setTotalItems(0);
    isLoadingMoreRef.current = false;
    // eslint-disable-next-line react-hooks/immutability
    setIsLoadingMoreState(false);
    previousSkipRef.current = initialSkip;
  }, [prismaQuerySerialized, pathParamsSerialized, pageSize, initialPage]);

  const currentPage = useMemo(() => {
    return Math.floor(skip / pageSize) + 1;
  }, [skip, pageSize]);

  // Crea il body completo per la funzione API
  // NOTA: Ignoriamo take e skip da prismaQuery se presenti, li gestiamo noi
  const requestBody = useMemo(() => {
    const { take: _, skip: __, ...restQuery } = prismaQuery || {};
    const baseBody = {
      take: pageSize,
      skip,
      ...restQuery,
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

  // Query key completa per questa specifica query (con body e path params)
  const queryKey = useMemo(
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
          `usePaginationWithState - Validation failed for ${apiFunction.name}, input data:`,
          response.data,
        );
        throw new Error(
          `Validation failed, ListType: ${
            apiFunction.name
          }, input data: ${JSON.stringify(response.data.data)}`,
        );
      }
      return response.data;
    },
    enabled: enabled, // Carica sempre quando enabled è true
    ...(cacheDisabled && {
      staleTime: 0,
    }),
  });

  // Aggiorna allData quando arrivano nuovi dati
  useEffect(() => {
    if (response?.data) {
      const newData = response.data;
      setCurrentPageData(newData);

      // Se è la prima pagina (skip === 0), sostituisci allData
      // Altrimenti aggiungi i nuovi dati a quelli esistenti
      if (skip === 0) {
        setAllData(newData);
      } else {
        // Aggiungi i nuovi dati in base a loadMoreOrder
        if (loadMoreOrder === "asc") {
          // Aggiungi all'inizio (per chat: messaggi vecchi in alto)
          setAllData((prev) => [...newData, ...prev]);
        } else {
          // Aggiungi alla fine (comportamento default)
          setAllData((prev) => [...prev, ...newData]);
        }
      }

      // Aggiorna totalPages e totalItems
      if (response.count !== undefined) {
        setTotalPages(Math.ceil(response.count / pageSize));
        setTotalItems(response.count);
      }

      // Reset isLoadingMoreRef e state quando arrivano i dati
      if (isLoadingMoreRef.current) {
        isLoadingMoreRef.current = false;
        setIsLoadingMoreState(false);
      }
    }
  }, [response, skip, pageSize, loadMoreOrder]);

  // Gestisci errori
  useEffect(() => {
    if (isError && error && onError) {
      onError(error);
    }
  }, [isError, error, onError]);

  // State per isLoadingMore (necessario perché i ref non triggerano re-render)
  const [isLoadingMoreState, setIsLoadingMoreState] = useState<boolean>(false);

  // Traccia quando skip cambia (significa che abbiamo chiamato loadMore)
  useEffect(() => {
    if (skip > previousSkipRef.current && allData.length > 0) {
      // Skip è aumentato e abbiamo già dei dati = stiamo caricando più dati
      isLoadingMoreRef.current = true;
      setIsLoadingMoreState(true);
      previousSkipRef.current = skip;
    } else if (skip === 0 || skip <= previousSkipRef.current) {
      // Reset o prima pagina
      previousSkipRef.current = skip;
      isLoadingMoreRef.current = false;
      setIsLoadingMoreState(false);
    }
  }, [skip, allData.length]);

  // Calcola isLoadingMore: true quando stiamo caricando più dati (non il caricamento iniziale)
  const isLoadingMore = useMemo(() => {
    // Usa lo state O isFetching quando abbiamo già dati
    return (
      isLoadingMoreState || (isFetching && !isLoading && allData.length > 0)
    );
  }, [isLoadingMoreState, isFetching, isLoading, allData.length]);

  // Calcola canLoadMore
  const canLoadMore = useMemo(() => {
    // Non possiamo caricare se non sappiamo quante pagine ci sono
    if (!totalPages || totalPages === 0) return false;
    // Non possiamo caricare se la prossima pagina supera il totale
    if (currentPage >= totalPages) return false;
    // Non possiamo caricare se stiamo già caricando
    if (isLoading || isFetching) return false;
    // Non possiamo caricare se stiamo già caricando più dati (previene chiamate multiple)
    // Usa isLoadingMoreState invece di isLoadingMoreRef.current perché i ref non triggerano re-render
    if (isLoadingMoreState) return false;
    return true;
  }, [currentPage, totalPages, isLoading, isFetching, isLoadingMoreState]);

  // Funzione loadMore
  const loadMore = useCallback(() => {
    // Controlla canLoadMore (calcolato da useMemo)
    if (!canLoadMore) {
      return Promise.resolve();
    }

    // Controllo aggiuntivo con ref per prevenire chiamate multiple durante scroll veloce
    // Il ref viene aggiornato immediatamente, mentre canLoadMore potrebbe non essere ancora aggiornato
    if (isLoadingMoreRef.current) {
      return Promise.resolve();
    }

    // Imposta il flag per prevenire chiamate multiple (ref + state)
    isLoadingMoreRef.current = true;
    setIsLoadingMoreState(true);

    // Incrementa skip per caricare la prossima pagina
    // La query si riattiverà automaticamente perché la queryKey include skip nel requestBody
    // React Query gestirà automaticamente isFetching quando la query parte
    const nextSkip = skip + pageSize;
    setSkip(nextSkip);

    return Promise.resolve();
  }, [canLoadMore, skip, pageSize]);

  // Funzione reset
  const reset = useCallback(() => {
    setAllData([]);
    setCurrentPageData([]);
    const initialSkip = (initialPage - 1) * pageSize;
    setSkip(initialSkip);
    setTotalPages(0);
    setTotalItems(0);
    isLoadingMoreRef.current = false;
    previousSkipRef.current = initialSkip;
    // Triggera un refetch per ricaricare la prima pagina
    refetch();
  }, [initialPage, pageSize, refetch]);

  return {
    allData,
    currentPageData,
    isLoading,
    isLoadingMore,
    isError,
    error,
    currentPage,
    totalPages,
    totalItems,
    refetch,
    loadMore,
    canLoadMore,
    reset,
    queryKey,
    setAllData,
  };
}
