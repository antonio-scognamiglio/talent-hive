/**
 * SearchableSelectPaginated Component
 *
 * Componente Select con ricerca lato server (Prisma) e paginazione automatica.
 * Mostra una lista iniziale paginata e supporta scroll infinito.
 *
 * ## Quando usare SearchableSelectPaginated
 *
 * ✅ **Usa SearchableSelectPaginated quando:**
 * - Il dataset può avere **più di 200 elementi**
 * - Serve una lista iniziale da navigare senza cercare
 * - Vuoi scroll infinito per caricare più risultati automaticamente
 *
 * ## Configurazione Prisma
 *
 * Configura due set di query options:
 *
 * 1. **paginationQueryOptions**: Per la lista iniziale paginata (pageSize: 24 di default)
 * 2. **searchQueryOptions**: Per la ricerca (con `take: 200` per limitare i risultati)
 *
 * ```typescript
 * const config: UseSearchableSelectPaginatedConfig<City> = {
 *   apiFunction: citySearchCities,
 *   searchFields: ["name", "postalCode"],
 *   paginationQueryOptions: {
 *     // Query per la lista iniziale (pagina per pagina)
 *     include: { province: true },
 *     orderBy: { name: "asc" },
 *   },
 *   searchQueryOptions: {
 *     // Query per la ricerca (limite 200)
 *     take: 200,
 *     include: { province: true },
 *     orderBy: { name: "asc" },
 *   },
 *   pageSize: 24, // Dimensione pagina per la lista iniziale
 * };
 * ```
 *
 * ## Comportamento
 *
 * - **Senza query**: Mostra lista paginata iniziale (pageSize elementi per volta)
 *   - Scroll infinito: quando si scrolla alla fine, carica automaticamente più risultati
 *   - I dati vengono fetchati pagina per pagina
 *
 * - **Con query**: Mostra risultati ricerca (limitati da `take` in `searchQueryOptions`)
 *   - La ricerca è indipendente dalla lista iniziale
 *   - Può trovare elementi esclusi dalla lista iniziale (se ci sono più di 200 elementi totali)
 *
 * - **Ricerca**: Sempre lato server (Prisma), prescinde dai dati mostrati
 *
 * ## Esempio
 *
 * ```typescript
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
 *   paginationQueryOptions: { orderBy: { name: "asc" } },
 *   searchQueryOptions: { take: 200 },
 *   pageSize: 24,
 * });
 *
 * <SearchableSelectPaginated
 *   displayResults={displayResults}
 *   query={query}
 *   setQuery={setQuery}
 *   isLoading={isLoading}
 *   isLoadingMore={isLoadingMore}
 *   canLoadMore={canLoadMore}
 *   loadMore={loadMore}
 *   onSelect={onSelect}
 *   onClear={onClear}
 *   getItemId={(city) => city.id}
 * />
 * ```
 *
 * @see SearchableSelect Per dataset limitati (~200 elementi) senza lista iniziale (di default)
 */

import * as React from "react";
import { useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UseSearchableSelectPaginatedReturn } from "@/features/shared/hooks/useSearchableSelectPaginated";
import { Spinner } from "../Spinner";

export interface SearchableSelectPaginatedProps<
  TApi,
  TFormatted = TApi,
> extends UseSearchableSelectPaginatedReturn<TApi, TFormatted> {
  // UI
  placeholder?: string;
  emptyMessage?: string;
  loadingMoreMessage?: string; // Messaggio personalizzabile per loadMore
  allLoadedMessage?: string; // Messaggio quando tutti gli elementi sono stati caricati
  errorMessage?: string; // Messaggio in caso di errore
  disabled?: boolean;
  className?: string;
  displayFormatter?: (item: TFormatted) => string;
  renderItem?: (result: TApi, isSelected: boolean) => React.ReactNode;

  // Form integration
  value?: string;
  onChange?: (id: string | undefined) => void;
  getItemId: (item: TApi) => string;
}

export function SearchableSelectPaginated<TApi, TFormatted = TApi>({
  placeholder = "Cerca e seleziona...",
  emptyMessage = "Nessun risultato trovato",
  loadingMoreMessage = "Caricamento...",
  allLoadedMessage = "Tutti gli elementi sono stati caricati",
  errorMessage = "Si è verificato un errore durante il caricamento",
  disabled = false,
  className,
  renderItem,
  displayFormatter,
  // Props dall'hook (UseSearchableSelectPaginatedReturn)
  selectedItem,
  query,
  setQuery,
  displayResults,
  isLoading,
  isLoadingMore,
  canLoadMore,
  loadMore,
  onSelect,
  onClear,
  isError,
  totalItems,
  // Props per form integration
  getItemId,
  onChange,
  value,
}: SearchableSelectPaginatedProps<TApi, TFormatted>) {
  const [open, setOpen] = React.useState(false);

  // Reset query quando il popover si chiude
  useEffect(() => {
    if (!open) {
      setQuery("");
    }
  }, [open, setQuery]);

  // Scroll detection per loadMore
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.currentTarget;
      const { scrollTop, scrollHeight, clientHeight } = target;

      // Threshold più alto: quando siamo a 150px dalla fine, carica più risultati
      // Così parte il loading prima che l'utente raggiunga il fondo
      const threshold = 150;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - threshold;

      if (isNearBottom && canLoadMore && !isLoadingMore && !query.trim()) {
        loadMore();
      }
    },
    [canLoadMore, isLoadingMore, loadMore, query],
  );

  // Logica display intelligente
  const getDisplayValue = (item: TFormatted): string => {
    if (typeof item === "string") {
      return item;
    }
    if (displayFormatter) {
      return displayFormatter(item);
    }
    return String(item);
  };

  const handleSelect = (result: TApi) => {
    const id = getItemId(result);

    onSelect(result);

    if (onChange) {
      onChange(id);
    }

    setOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClear();

    if (onChange) {
      onChange(undefined);
    }
  };

  const isSelected = (item: TApi): boolean => {
    if (!selectedItem) return false;
    const itemId = getItemId(item);

    // Se selectedItem è un oggetto con id, confronta per ID
    if (
      selectedItem &&
      typeof selectedItem === "object" &&
      "id" in selectedItem
    ) {
      const selectedId = (selectedItem as Record<string, unknown>).id;
      return itemId === selectedId || String(itemId) === String(selectedId);
    }

    // Fallback: confronto diretto
    return selectedItem === (item as unknown as TFormatted);
  };

  // Trova l'item selezionato per il display
  const selectedItemForDisplay = useMemo(() => {
    if (!value) return selectedItem;

    // Se abbiamo un value ma non selectedItem, cerca nei risultati
    if (!selectedItem) {
      const found = displayResults.find((item) => getItemId(item) === value);
      return found ? (found as unknown as TFormatted) : null;
    }

    return selectedItem;
  }, [value, selectedItem, displayResults, getItemId]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between relative",
            disabled && "opacity-50",
            className,
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-6">
            {selectedItemForDisplay ? (
              <span className="truncate text-left">
                {getDisplayValue(selectedItemForDisplay)}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div
              onClick={selectedItemForDisplay ? handleClear : undefined}
              onMouseDown={(e) => {
                if (selectedItemForDisplay) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              className={cn(
                "h-5 w-5 flex items-center justify-center rounded-sm transition-colors",
                selectedItemForDisplay
                  ? "opacity-50 hover:opacity-100 hover:bg-accent cursor-pointer"
                  : "opacity-0 pointer-events-none",
                disabled && "pointer-events-none",
              )}
              aria-label={selectedItemForDisplay ? "Deseleziona" : undefined}
              role={selectedItemForDisplay ? "button" : undefined}
              tabIndex={selectedItemForDisplay ? 0 : -1}
            >
              <X className="h-4 w-4" />
            </div>
            <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Inizia a digitare per cercare..."
            value={query}
            onValueChange={setQuery}
            className="h-9"
          />
          <CommandList onScroll={handleScroll} className="max-h-[300px]">
            {isLoading && displayResults.length === 0 ? (
              // Loading iniziale/ricerca: mostra solo quando non ci sono risultati
              <div className="flex items-center justify-center p-3">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm">Ricerca in corso...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {displayResults.map((result, index) => {
                    const selected = isSelected(result);
                    return (
                      <CommandItem
                        key={`${getItemId(result)}-${index}`}
                        value={String(index)}
                        onSelect={() => handleSelect(result)}
                      >
                        {renderItem ? (
                          renderItem(result, selected)
                        ) : (
                          <div
                            className={cn(
                              "flex w-full items-center justify-between",
                              selected && "font-medium",
                            )}
                          >
                            <span className="truncate">
                              {getDisplayValue(result as unknown as TFormatted)}
                            </span>
                            {selected ? (
                              <span className="text-xs text-muted-foreground">
                                Selezionato
                              </span>
                            ) : null}
                          </div>
                        )}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
                {/* Footer sempre visibile: mostra stato del caricamento */}
                {displayResults.length > 0 &&
                  !query.trim() &&
                  (isLoadingMore ||
                    isError ||
                    (totalItems > 0 &&
                      displayResults.length >= totalItems)) && (
                    <div className="flex items-center justify-center py-3 px-4 border-t bg-muted/20">
                      {isError ? (
                        <span className="text-sm text-destructive">
                          {errorMessage}
                        </span>
                      ) : isLoadingMore ? (
                        <div className="flex items-center gap-2">
                          <Spinner size="sm" variant="default" />
                          <span className="text-sm text-muted-foreground">
                            {loadingMoreMessage}
                          </span>
                        </div>
                      ) : totalItems > 0 &&
                        displayResults.length >= totalItems ? (
                        <span className="text-sm text-muted-foreground">
                          {allLoadedMessage}
                        </span>
                      ) : null}
                    </div>
                  )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
