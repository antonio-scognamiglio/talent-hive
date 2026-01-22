/**
 * useUrlFilters Hook
 *
 * Hook generico per sincronizzare filtri con query params nell'URL.
 * Permette di:
 * - Leggere i filtri dall'URL al caricamento della pagina
 * - Scrivere i filtri nell'URL quando cambiano
 * - Mantenere sincronizzazione bidirezionale tra filtri e URL
 */

import { useSearchParams } from "react-router-dom";
import { useCallback, useMemo } from "react";

/**
 * Configurazione per un singolo filtro URL param
 */
export interface FilterParamConfig<TFilters extends Record<string, unknown>> {
  /** Nome del parametro nell'URL (es. "q", "status", "client") */
  param: string;
  /** Chiave nel tuo oggetto filters (es. "searchTerm", "statusFilter", "clientFilter") */
  key: keyof TFilters;
  /** Converte stringa URL → valore filtro (es. "closed" -> "closed" | "all") */
  parse: (value: string | null) => TFilters[keyof TFilters] | undefined;
  /** Converte valore filtro → stringa URL (se undefined/null/empty => rimuove param) */
  serialize: (value: TFilters[keyof TFilters] | undefined) => string | null;
}

/**
 * Hook per sincronizzare filtri con query params
 *
 * @example
 * ```ts
 * const { filtersFromUrl, setFiltersInUrl } = useUrlFilters<CaseFilters>(
 *   [
 *     {
 *       param: "q",
 *       key: "searchTerm",
 *       parse: (v) => (v && v.trim() !== "" ? v : undefined),
 *       serialize: (v) => (v && v.trim() !== "" ? v : null),
 *     },
 *     {
 *       param: "status",
 *       key: "statusFilter",
 *       parse: (v) => (v === "active" || v === "closed" ? v : "all"),
 *       serialize: (v) => (v && v !== "all" ? v : null),
 *     },
 *   ],
 *   { searchTerm: "", statusFilter: "all" }
 * );
 * ```
 */
export function useUrlFilters<TFilters extends Record<string, unknown>>(
  configs: FilterParamConfig<TFilters>[],
  defaults: TFilters,
) {
  const [searchParams, setSearchParams] = useSearchParams();

  // 1. Leggi filtri dallo URL
  const filtersFromUrl: TFilters = useMemo(() => {
    const result: Record<string, unknown> = { ...defaults };

    for (const cfg of configs) {
      const raw = searchParams.get(cfg.param);
      const parsed = cfg.parse(raw);
      if (parsed !== undefined) {
        result[cfg.key as string] = parsed;
      }
    }

    return result as TFilters;
  }, [searchParams, configs, defaults]);

  // 2. Scrivi filtri nello URL
  const setFiltersInUrl = useCallback(
    (next: Partial<TFilters>) => {
      setSearchParams(
        (prev) => {
          const sp = new URLSearchParams(prev);

          for (const cfg of configs) {
            // Se il nuovo valore è fornito in 'next', usalo.
            if (Object.prototype.hasOwnProperty.call(next, cfg.key)) {
              const newValue = next[cfg.key];
              const serialized = cfg.serialize(newValue);

              if (serialized === null || serialized === "") {
                sp.delete(cfg.param);
              } else {
                sp.set(cfg.param, serialized);
              }
            }
            // Altrimenti lascia il valore corrente nell'URL inalterato!
            // (Non serve ri-parsare o fare merge manuale, perché stiamo modificando 'prev' che ha già i valori vecchi)
          }

          return sp;
        },
        { replace: true },
      );
    },
    [configs, setSearchParams],
  );

  return { filtersFromUrl, setFiltersInUrl };
}
