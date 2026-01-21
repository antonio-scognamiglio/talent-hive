/**
 * SearchableMultiSelectPaginated Component
 *
 * Componente Select per selezione multipla con ricerca lato server (Prisma) e paginazione automatica.
 * Mostra una lista iniziale paginata, supporta scroll infinito e ricerca lato server.
 *
 * ## Quando usare SearchableMultiSelectPaginated
 *
 * ✅ **Usa SearchableMultiSelectPaginated quando:**
 * - Devi permettere la **selezione multipla** di elementi
 * - Il dataset può avere **più di 200 elementi**
 * - Serve una lista iniziale da navigare senza cercare
 * - Vuoi scroll infinito per caricare più risultati automaticamente
 * - Vuoi ricerca lato server per trovare elementi specifici
 *
 * ## Differenze con altri componenti
 *
 * | Caratteristica | SearchableMultiSelectPaginated | MultiSelect | SearchableSelectPaginated |
 * |----------------|----------------------|------------|--------------------------|
 * | Selezione | Multipla (`string[]`) | Multipla (`string[]`) | Singola (`string`) |
 * | Ricerca | Lato server (API) | Lato client (filtra array) | Lato server (API) |
 * | Items | Ricerca + paginazione | Array già caricato | Ricerca + paginazione |
 * | Lista iniziale | ✅ Sì (paginata) | ✅ Sì (array locale) | ✅ Sì (paginata) |
 * | Scroll infinito | ✅ Sì | ❌ No | ✅ Sì |
 * | Badge selezionati | ✅ Sì | ✅ Sì | ❌ No |
 *
 * ## Configurazione Prisma
 *
 * Configura due set di query options:
 *
 * 1. **paginationQueryOptions**: Per la lista iniziale paginata (pageSize: 24 di default)
 * 2. **searchQueryOptions**: Per la ricerca (con `take: 200` per limitare i risultati)
 *
 * ```typescript
 * const config: UseSearchableMultiSelectPaginatedConfig<Expertise> = {
 *   apiFunction: expertiseSearchExpertises,
 *   searchFields: ["name", "description"],
 *   getItemId: (e) => e.id,
 *   paginationQueryOptions: {
 *     // Query per la lista iniziale (pagina per pagina)
 *     orderBy: { name: "asc" },
 *   },
 *   searchQueryOptions: {
 *     // Query per la ricerca (limite 200)
 *     take: 200,
 *     orderBy: { name: "asc" },
 *   },
 *   pageSize: 24, // Dimensione pagina per la lista iniziale
 *   initialSelectedIds: ["id1", "id2"], // Opzionale
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
 * - **Selezione multipla**: Gli elementi selezionati vengono mostrati come badge rimovibili
 *
 * ## Esempio
 *
 * ```typescript
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
 * } = useSearchableMultiSelectPaginated({
 *   apiFunction: expertiseSearchExpertises,
 *   searchFields: ["name"],
 *   getItemId: (e) => e.id,
 *   paginationQueryOptions: { orderBy: { name: "asc" } },
 *   searchQueryOptions: { take: 200 },
 *   pageSize: 24,
 * });
 *
 * <SearchableMultiSelectPaginated<Expertise>
 *   selectedIds={selectedIds}
 *   selectedItems={selectedItems}
 *   displayResults={displayResults}
 *   query={query}
 *   setQuery={setQuery}
 *   isLoading={isLoading}
 *   isLoadingMore={isLoadingMore}
 *   canLoadMore={canLoadMore}
 *   loadMore={loadMore}
 *   onToggle={onToggle}
 *   onRemove={onRemove}
 *   getItemId={(e) => e.id}
 *   getItemLabel={(e) => e.name}
 *   value={field.value || []}
 *   onChange={field.onChange}
 *   maxSelections={5}
 * />
 * ```
 *
 * @see MultiSelect Per selezione multipla con ricerca lato client (array già caricato, non paginato)
 * @see SearchableSelectPaginated Per selezione singola con ricerca e paginazione
 */

import * as React from "react";
import { useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import type { UseSearchableMultiSelectPaginatedReturn } from "@/features/shared/hooks/useSearchableMultiSelectPaginated";
import { Spinner } from "../Spinner";

export interface SearchableMultiSelectPaginatedProps<
  TApi,
  TFormatted = TApi,
> extends UseSearchableMultiSelectPaginatedReturn<TApi> {
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
  renderBadge?: (item: TApi, onRemove: () => void) => React.ReactNode;

  // Form integration
  value?: string[];
  onChange?: (ids: string[]) => void;
  getItemId: (item: TApi) => string;
  getItemLabel: (item: TApi) => string;

  // Selezione multipla
  maxSelections?: number;
  minSelections?: number;
  badgePosition?: "top" | "bottom";
}

export function SearchableMultiSelectPaginated<TApi, TFormatted = TApi>({
  placeholder = "+ Seleziona",
  emptyMessage = "Nessun risultato trovato",
  loadingMoreMessage = "Caricamento...",
  allLoadedMessage = "Tutti gli elementi sono stati caricati",
  errorMessage = "Si è verificato un errore durante il caricamento",
  disabled = false,
  className,
  renderItem,
  renderBadge,
  displayFormatter,
  // Props dall'hook (UseSearchableMultiSelectPaginatedReturn)
  selectedIds,
  selectedItems,
  query,
  setQuery,
  displayResults,
  isLoading,
  isLoadingMore,
  canLoadMore,
  loadMore,
  onToggle,
  onRemove,
  isError,
  totalItems,
  // Props per form integration
  getItemId,
  getItemLabel,
  value,
  onChange,
  // Props per selezione multipla
  maxSelections,
  badgePosition = "top",
}: SearchableMultiSelectPaginatedProps<TApi, TFormatted>) {
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

  // Determina se possiamo aggiungere più selezioni
  const canAddMore = useMemo(() => {
    const currentCount = value?.length ?? selectedIds.length;
    return typeof maxSelections === "number"
      ? currentCount < maxSelections
      : true;
  }, [value, selectedIds, maxSelections]);

  // Gestisce il toggle di selezione
  const handleToggle = (item: TApi) => {
    const id = getItemId(item);
    const currentIds = value ?? selectedIds;

    if (currentIds.includes(id)) {
      // Rimuovi
      const newIds = currentIds.filter((x) => x !== id);
      if (onChange) {
        onChange(newIds);
      }
      onRemove(id);
    } else if (canAddMore) {
      // Aggiungi
      const newIds = [...currentIds, id];
      if (onChange) {
        onChange(newIds);
      }
      onToggle(item);
    }
  };

  // Verifica se un item è selezionato
  const isSelected = (item: TApi): boolean => {
    const id = getItemId(item);
    const currentIds = value ?? selectedIds;
    return currentIds.includes(id);
  };

  // Items selezionati per il display (usa value se disponibile, altrimenti selectedItems)
  // Cerca prima in selectedItems (che contiene la cache), poi in displayResults
  const displaySelectedItems = useMemo(() => {
    const idsToFind = value ?? selectedIds;

    // Cerca prima in selectedItems (cache dell'hook)
    const fromCache = idsToFind
      .map((id) => selectedItems.find((item) => getItemId(item) === id))
      .filter(Boolean) as TApi[];

    // Per gli ID non trovati nella cache, cerca in displayResults
    const foundIds = new Set(fromCache.map((item) => getItemId(item)));
    const fromDisplay = idsToFind
      .filter((id) => !foundIds.has(id))
      .map((id) => displayResults.find((item) => getItemId(item) === id))
      .filter(Boolean) as TApi[];

    return [...fromCache, ...fromDisplay];
  }, [value, selectedIds, selectedItems, displayResults, getItemId]);

  // Render badge per elementi selezionati
  const renderBadges = () => (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        badgePosition === "top" ? "mb-2" : "mt-2",
      )}
    >
      {displaySelectedItems.map((item: TApi) => {
        const id = getItemId(item);
        const label = getItemLabel(item);
        const handleRemove = () => {
          if (onChange) {
            const newIds = (value ?? selectedIds).filter((x) => x !== id);
            onChange(newIds);
          }
          onRemove(id);
        };
        return renderBadge ? (
          <React.Fragment key={id}>
            {renderBadge(item, handleRemove)}
          </React.Fragment>
        ) : (
          <Badge key={id} variant="secondary" className="gap-1 rounded-lg">
            {label}
            <X
              className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
              onClick={handleRemove}
            />
          </Badge>
        );
      })}
    </div>
  );

  return (
    <div className={cn("w-full", className)}>
      {badgePosition === "top" && renderBadges()}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
            className={cn("w-full justify-between", disabled && "opacity-50")}
          >
            <span className="truncate text-left">
              {(value?.length ?? selectedIds.length) > 0
                ? `${value?.length ?? selectedIds.length} selezionati`
                : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
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
                      const itemDisabled = !selected && !canAddMore;
                      return (
                        <CommandItem
                          key={`${getItemId(result)}-${index}`}
                          value={String(index)}
                          disabled={itemDisabled}
                          onSelect={() => handleToggle(result)}
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
                                {getDisplayValue(
                                  result as unknown as TFormatted,
                                )}
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

      {badgePosition === "bottom" && renderBadges()}
    </div>
  );
}
