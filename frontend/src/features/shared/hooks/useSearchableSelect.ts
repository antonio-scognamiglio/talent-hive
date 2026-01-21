/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * useSearchableSelect Hook
 *
 * Hook per gestire ricerca lato server (Prisma) senza paginazione.
 * Ideale per dataset con massimo ~200 elementi.
 *
 * ## Caratteristiche
 *
 * - **Nessuna lista iniziale**: I risultati appaiono solo quando l'utente digita
 * - **Ricerca lato server**: Ogni ricerca fa una chiamata API con condizioni Prisma
 * - **Limite risultati**: Configura `take: 200` nelle `queryOptions` per limitare i risultati
 * - **Debounce**: Ricerca automatica dopo 300ms (configurabile)
 *
 * ## Configurazione
 *
 * ```typescript
 * const config: SearchableSelectConfig<City> = {
 *   apiFunction: citySearchCities,
 *   searchFields: ["name", "postalCode"], // Campi su cui cercare
 *   queryOptions: {
 *     take: 200, // Limita i risultati della ricerca
 *     include: { province: true },
 *   },
 * };
 * ```
 *
 * ## Comportamento Ricerca
 *
 * La ricerca è sempre lato server e prescinde dai dati mostrati:
 * - Ogni query genera una chiamata API con condizioni Prisma `OR`
 * - I risultati sono limitati da `take` nelle `queryOptions`
 * - Se ci sono più di 200 elementi totali, alcuni potrebbero non essere trovabili
 * - **Senza query**: `results` è vuoto (`[]`) - nessuna lista iniziale mostrata
 *
 * ## Workaround: Lista iniziale (non consigliato)
 *
 * ⚠️ **Nota**: Per mostrare una lista iniziale, invece di passare i `results` restituiti dall'hook,
 * si potrebbe passare condizionalmente al componente: se `query.trim()` è vuoto, passare una lista iniziale
 * (es. `initialItems`), altrimenti passare i `results` dall'hook.
 * Questo è un **workaround non consigliato** perché l'hook è pensato per gestire `results` internamente.
 *
 * Per una soluzione più pulita con lista iniziale, usa `useSearchableSelectPaginated`.
 *
 * @see useSearchableSelectPaginated Per dataset più grandi con scroll infinito e lista iniziale
 */

import { useCallback, useState, useMemo, useEffect, useRef } from "react";
import type {
  StringKeys,
  PrismaWhere,
  PrismaQueryOptions,
} from "@/features/shared/types/prismaQuery.types";
import type { ApiFunctionForGen } from "@/features/shared/types/api.types";

export interface SearchableSelectConfig<
  TApi,
  TFormatted = TApi,
  TBody = any,
  TPath = any,
> {
  apiFunction: ApiFunctionForGen<any, TBody, TPath>;
  // Opzioni che vengono combinate con le condizioni di ricerca
  queryOptions?: PrismaQueryOptions<TApi>;
  pathParams?: Record<string, any>; // Parametri per il path dell'API (es. { firmId, clientId })
  // Initial item, serve solo ad una cosa, all'hook useSearchableSelect che lo carica in selectedItem. Quindi l'unico valore di riferimento per chi vuole syncarsi è selectedItem.
  initialItem?: TFormatted;
  searchFields: StringKeys<TApi>[];
  // Servono per fare ricerche complesse per esempio su campi innestati
  orConditions?: ((searchTerm: string) => PrismaWhere<TApi>)[];
  //Queste callback servono per syncare con stati esterni
  onSelect?: (item: TFormatted) => void;
  onClear?: () => void;
  splitSearchTerms?: boolean;
  debounceMs?: number;

  // 🎯 Trasformazione opzionale: TApi → TFormatted
  format?: (item: TApi) => TFormatted;
}

export interface UseSearchableSelectReturn<TApi, TFormatted = TApi> {
  selectedItem: TFormatted | null;
  query: string;
  setQuery: (query: string) => void;
  results: TApi[];
  isSearching: boolean;
  onSelect: (item: TApi) => void;
  onClear: () => void;
}

export const useSearchableSelect = <TApi, TFormatted = TApi>({
  apiFunction,
  searchFields,
  queryOptions,
  pathParams,
  initialItem,
  orConditions,
  onSelect: onSelectConfig,
  onClear: onClearConfig,
  splitSearchTerms = true,
  debounceMs = 300,
  format,
}: SearchableSelectConfig<TApi, TFormatted>): UseSearchableSelectReturn<
  TApi,
  TFormatted
> => {
  const [isSearching, setIsSearching] = useState(false);
  const [selectedItem, setSelectedItem] = useState<TFormatted | null>(
    initialItem ?? null,
  );
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TApi[]>([]);

  // Memoize the search fields to prevent unnecessary re-renders
  const memoizedSearchFields = useMemo(() => searchFields, [searchFields]);

  const memoizedOrConditions = useMemo(
    () => orConditions || [],
    [orConditions],
  );

  // Sincronizza selectedItem quando initialItem cambia (reattività)
  useEffect(() => {
    if (initialItem) {
      setSelectedItem(initialItem);
    }
  }, [initialItem]);

  // Funzione di ricerca
  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!searchTerm.trim()) {
        setResults([]);
        return;
      }

      try {
        setIsSearching(true);

        let searchConditions: PrismaWhere<TApi>[] = [];

        if (splitSearchTerms) {
          // Dividi la query in parole e crea condizioni per ogni parola
          const words = searchTerm
            .trim()
            .split(/\s+/)
            .filter((word) => word.length > 0);

          if (words.length > 1) {
            // Per ogni campo di ricerca, crea una condizione AND che richiede tutte le parole
            const fieldConditions = memoizedSearchFields.map(
              (field) =>
                ({
                  AND: words.map((word) => ({
                    [field]: { contains: word, mode: "insensitive" },
                  })),
                }) as PrismaWhere<TApi>,
            );
            searchConditions.push(...fieldConditions);
          } else {
            // Se c'è solo una parola, usa la ricerca normale
            searchConditions = memoizedSearchFields.map(
              (field) =>
                ({
                  [field]: { contains: searchTerm, mode: "insensitive" },
                }) as PrismaWhere<TApi>,
            );
          }
        } else {
          // Ricerca normale senza divisione in parole
          searchConditions = memoizedSearchFields.map(
            (field) =>
              ({
                [field]: { contains: searchTerm, mode: "insensitive" },
              }) as PrismaWhere<TApi>,
          );
        }

        const dynamicConditions = memoizedOrConditions.map((condition) =>
          condition(searchTerm),
        );

        const response = await apiFunction({
          body: {
            ...queryOptions,
            where: {
              OR: [...searchConditions, ...dynamicConditions],
            },
          },
          path: pathParams || ({} as any), // Path params se forniti, altrimenti oggetto vuoto
        });

        let data: TApi[] = [];
        if (response.data && Array.isArray(response.data)) {
          data = response.data;
        } else if (
          response.data &&
          response.data.data &&
          Array.isArray(response.data.data)
        ) {
          data = response.data.data;
        }

        setResults(data);
      } catch (error) {
        console.error("Errore durante la ricerca:", error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [
      splitSearchTerms,
      memoizedOrConditions,
      apiFunction,
      queryOptions,
      memoizedSearchFields,
      pathParams,
    ],
  );

  // Debounce per la ricerca
  const searchRef = useRef(performSearch);
  useEffect(() => {
    searchRef.current = performSearch;
  }, [performSearch]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      searchRef.current(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const onSelect = useCallback(
    (item: TApi) => {
      const finalValue = format
        ? format(item)
        : (item as unknown as TFormatted);
      setSelectedItem(finalValue);
      setQuery(""); // Reset query quando si seleziona
      if (onSelectConfig) {
        onSelectConfig(finalValue);
      }
    },
    [format, onSelectConfig],
  );

  const onClear = useCallback(() => {
    setSelectedItem(null);
    setQuery(""); // Reset query quando si deseleziona
    if (onClearConfig) {
      onClearConfig();
    }
  }, [onClearConfig]);

  return {
    selectedItem,
    query,
    setQuery,
    results,
    isSearching,
    onSelect,
    onClear,
  };
};
