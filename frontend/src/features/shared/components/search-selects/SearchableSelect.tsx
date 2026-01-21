/**
 * SearchableSelect Component
 *
 * Componente Select con ricerca lato server (Prisma) per dataset limitati.
 * Non mostra una lista iniziale: i risultati appaiono solo quando l'utente digita.
 *
 * ## Quando usare SearchableSelect
 *
 * ✅ **Usa SearchableSelect quando:**
 * - Il dataset totale ha **massimo ~200 elementi**
 * - Non serve una lista iniziale da navigare
 * - L'utente deve cercare per trovare l'elemento desiderato
 *
 * ## Configurazione Prisma
 *
 * Configura `queryOptions` con `take: 200` per limitare i risultati della ricerca:
 *
 * ```typescript
 * const searchConfig: SearchableSelectConfig<City> = {
 *   apiFunction: citySearchCities,
 *   searchFields: ["name", "postalCode"],
 *   queryOptions: {
 *     take: 200, // Limita i risultati della ricerca
 *     include: { province: true },
 *   },
 * };
 * ```
 *
 * ## Comportamento
 *
 * - **Senza query**: Nessun risultato mostrato (lista vuota) - di default
 * - **Con query**: Chiamata API lato server con condizioni di ricerca Prisma
 * - **Ricerca**: Indipendente dai dati mostrati, sempre lato server
 * - **Limite**: I risultati sono limitati da `take` nelle `queryOptions`
 *
 * ## Esempio
 *
 * ```typescript
 * const {
 *   selectedItem,
 *   query,
 *   setQuery,
 *   results,
 *   isSearching,
 *   onSelect,
 *   onClear,
 * } = useSearchableSelect({
 *   apiFunction: citySearchCities,
 *   searchFields: ["name"],
 *   queryOptions: { take: 200 },
 * });
 *
 * <SearchableSelect
 *   selectedItem={selectedItem}
 *   query={query}
 *   setQuery={setQuery}
 *   results={results}
 *   isSearching={isSearching}
 *   onSelect={onSelect}
 *   onClear={onClear}
 *   getItemId={(city) => city.id}
 * />
 * ```
 *
 * ## Workaround: Lista iniziale (non consigliato)
 *
 * ⚠️ **Nota**: Tecnicamente è possibile mostrare una lista iniziale passando `results` condizionalmente al componente:
 * se `query.trim()` è vuoto, passare una lista iniziale (es. `initialItems`), altrimenti passare i `results`
 * restituiti dall'hook `useSearchableSelect`.
 *
 * ```typescript
 * const { query, results, ... } = useSearchableSelect({ ... });
 * const initialItems = [...]; // Lista iniziale da mostrare
 *
 * <SearchableSelect
 *   // ... altre props
 *   results={query.trim() ? results : initialItems} // Workaround: passaggio condizionale
 * />
 * ```
 *
 * Questo è un **workaround non consigliato** perché il componente è pensato per ricevere i dati dall'hook.
 * Per una soluzione più pulita con lista iniziale, usa `SearchableSelectPaginated`.
 *
 * @see SearchableSelectPaginated Per dataset più grandi con scroll infinito
 */

import * as React from "react";
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
import type { UseSearchableSelectReturn } from "@/features/shared/hooks/useSearchableSelect";

export interface SearchableSelectProps<TApi, TFormatted = TApi>
  extends UseSearchableSelectReturn<TApi, TFormatted> {
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  renderItem?: (result: TApi, isSelected: boolean) => React.ReactNode;
  displayFormatter?: (item: TFormatted) => string;

  // Props standard per integrazione form (come MultiSelect)
  onChange?: (id: string | undefined) => void;
  getItemId: (item: TApi) => string;
}

export function SearchableSelect<TApi, TFormatted = TApi>({
  placeholder = "Cerca e seleziona...",
  emptyMessage = "Nessun risultato trovato",
  disabled = false,
  className,
  renderItem,
  displayFormatter,
  selectedItem,
  query,
  setQuery,
  results,
  isSearching,
  onSelect,
  onClear,
  getItemId,
  onChange,
}: SearchableSelectProps<TApi, TFormatted>) {
  const [open, setOpen] = React.useState(false);

  // Reset query quando il popover si chiude
  React.useEffect(() => {
    if (!open) {
      setQuery("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
            className
          )}
        >
          <div className="flex items-center gap-2 flex-1 min-w-0 pr-6">
            {selectedItem ? (
              <span className="truncate text-left">
                {getDisplayValue(selectedItem)}
              </span>
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <div
              onClick={selectedItem ? handleClear : undefined}
              onMouseDown={(e) => {
                if (selectedItem) {
                  e.stopPropagation();
                  e.preventDefault();
                }
              }}
              className={cn(
                "h-5 w-5 flex items-center justify-center rounded-sm transition-colors",
                selectedItem
                  ? "opacity-50 hover:opacity-100 hover:bg-accent cursor-pointer"
                  : "opacity-0 pointer-events-none",
                disabled && "pointer-events-none"
              )}
              aria-label={selectedItem ? "Deseleziona" : undefined}
              role={selectedItem ? "button" : undefined}
              tabIndex={selectedItem ? 0 : -1}
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
          <CommandList>
            {isSearching ? (
              <div className="flex items-center justify-center p-3">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                <span className="ml-2 text-sm">Ricerca in corso...</span>
              </div>
            ) : (
              <>
                <CommandEmpty>{emptyMessage}</CommandEmpty>
                <CommandGroup>
                  {results.map((result, index) => {
                    const selected = isSelected(result);
                    return (
                      <CommandItem
                        key={index}
                        value={String(index)}
                        onSelect={() => handleSelect(result)}
                      >
                        {renderItem ? (
                          renderItem(result, selected)
                        ) : (
                          <div
                            className={cn(
                              "flex w-full items-center justify-between",
                              selected && "font-medium"
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
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
