/**
 * MultiSelect Component
 *
 * Componente Select per selezione multipla con ricerca lato client.
 * Gestisce la selezione di più elementi da un array già caricato.
 *
 * ## Quando usare MultiSelect
 *
 * ✅ **Usa MultiSelect quando:**
 * - Devi permettere la **selezione multipla** di elementi
 * - Hai un **array di items già caricato** (non serve ricerca lato server)
 * - Il dataset è **limitato** e può essere caricato completamente in memoria
 * - Vuoi **ricerca lato client** per filtrare gli items localmente
 *
 * ## Differenze con SearchableSelect
 *
 * | Caratteristica | MultiSelect | SearchableSelect |
 * |----------------|-------------|------------------|
 * | Selezione | Multipla (`string[]`) | Singola (`string`) |
 * | Ricerca | Lato client (filtra array locale) | Lato server (chiamata API) |
 * | Items | Array già caricato come prop | Nessuna lista iniziale |
 * | Hook dedicato | ❌ No | ✅ `useSearchableSelect` |
 * | Badge selezionati | ✅ Sì | ❌ No |
 *
 * ## Caratteristiche
 *
 * - **Selezione multipla**: Gestisce array di ID (`value: string[]`)
 * - **Ricerca lato client**: Filtra l'array `items` localmente usando `searchKeys`
 * - **Badge selezionati**: Mostra gli elementi selezionati come badge rimovibili
 * - **Limite selezioni**: Supporta `maxSelections` per limitare il numero di selezioni
 * - **Loading state**: Supporta `isLoading` per mostrare stato di caricamento
 * - **Posizione badge**: Configurabile (`badgePosition: "top" | "bottom"`)
 *
 * ## Configurazione
 *
 * ```typescript
 * <MultiSelect<Expertise>
 *   items={expertises} // Array già caricato
 *   value={selectedIds} // Array di ID selezionati
 *   onChange={setSelectedIds} // Callback per aggiornare selezione
 *   getItemId={(e) => e.id} // Funzione per estrarre ID
 *   getItemLabel={(e) => e.name} // Funzione per estrarre label
 *   searchKeys={["name", "description"]} // Campi su cui cercare (lato client)
 *   maxSelections={5} // Limite opzionale di selezioni
 *   placeholder="Seleziona specializzazioni..."
 *   emptyMessage="Nessun risultato"
 *   badgePosition="top" // Badge sopra o sotto il select
 * />
 * ```
 *
 * ## Esempio con React Hook Form
 *
 * ```typescript
 * <FormField
 *   control={control}
 *   name="expertiseIds"
 *   render={({ field }) => (
 *     <FormItem>
 *       <FormLabel>Specializzazioni</FormLabel>
 *       <FormControl>
 *         <MultiSelect<Expertise>
 *           items={expertises}
 *           value={field.value || []}
 *           onChange={field.onChange}
 *           getItemId={(e) => e.id}
 *           getItemLabel={(e) => e.name}
 *           searchKeys={["name", "description"]}
 *           maxSelections={5}
 *         />
 *       </FormControl>
 *       <FormMessage />
 *     </FormItem>
 *   )}
 * />
 * ```
 *
 * ## Ricerca Lato Client
 *
 * La ricerca filtra l'array `items` localmente:
 * - Usa `searchKeys` per specificare i campi su cui cercare
 * - Se `searchKeys` non è fornito, cerca automaticamente in tutti i campi stringa
 * - La ricerca è case-insensitive e cerca la sottostringa
 * - Non fa chiamate API, lavora solo sull'array locale
 *
 * ## Badge e Rimozione
 *
 * Gli elementi selezionati vengono mostrati come badge:
 * - Posizione configurabile (`badgePosition: "top" | "bottom"`)
 * - Ogni badge ha un pulsante X per rimuovere la selezione
 * - Supporta `renderBadge` personalizzato per badge custom
 *
 * @see SearchableSelect Per selezione singola con ricerca lato server
 */

import * as React from "react";
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
import type { StringKeys } from "../../types/prismaQuery.types";

export interface MultiSelectProps<TItem> {
  items: TItem[];
  value: string[];
  onChange: (ids: string[]) => void;

  getItemId: (item: TItem) => string;
  getItemLabel: (item: TItem) => string;

  searchKeys?: StringKeys<TItem>[];
  searchPlaceholder?: string;

  maxSelections?: number;
  minSelections?: number;

  placeholder?: string;
  emptyMessage?: string;
  loadingMessage?: string;
  disabled?: boolean;
  className?: string;

  renderItem?: (item: TItem, isSelected: boolean) => React.ReactNode;
  renderBadge?: (item: TItem, onRemove: () => void) => React.ReactNode;
  isLoading?: boolean;

  badgePosition?: "top" | "bottom";
}

export function MultiSelect<TItem>(props: MultiSelectProps<TItem>) {
  const {
    items,
    value,
    onChange,
    getItemId,
    getItemLabel,
    searchKeys,
    searchPlaceholder = "Cerca...",
    maxSelections,
    placeholder = "+ Seleziona",
    emptyMessage = "Nessun risultato",
    loadingMessage = "Caricamento...",
    disabled = false,
    className,
    renderItem,
    renderBadge,
    isLoading = false,
    badgePosition = "top",
  } = props;

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const idToItem = React.useMemo(() => {
    const map = new Map<string, TItem>();
    for (const it of items) {
      map.set(getItemId(it), it);
    }
    return map;
  }, [items, getItemId]);

  const selectedItems = React.useMemo(
    () => value.map((id) => idToItem.get(id)).filter(Boolean) as TItem[],
    [value, idToItem],
  );

  const canAddMore = React.useMemo(
    () =>
      typeof maxSelections === "number" ? value.length < maxSelections : true,
    [value.length, maxSelections],
  );

  const normalizedQuery = query.trim().toLowerCase();

  const isStringKey = React.useCallback(
    (obj: TItem | undefined, key: keyof TItem): key is StringKeys<TItem> => {
      if (!obj) return false;
      const value = (obj as Record<string, unknown>)[key as string];
      return typeof value === "string";
    },
    [],
  );

  const getStringValue = React.useCallback(
    (obj: TItem, key: StringKeys<TItem>): string => {
      const value = (obj as Record<string, unknown>)[key as string];
      return typeof value === "string" ? value : "";
    },
    [],
  );

  const filteredItems = React.useMemo(() => {
    if (!normalizedQuery) return items;
    const keys =
      searchKeys && searchKeys.length > 0
        ? searchKeys
        : ((Object.keys(items[0] ?? {}) as (keyof TItem)[]).filter((k) =>
            isStringKey(items[0], k),
          ) as StringKeys<TItem>[]);

    return items.filter((item) =>
      keys.some((k) =>
        getStringValue(item, k).toLowerCase().includes(normalizedQuery),
      ),
    );
  }, [items, normalizedQuery, searchKeys, isStringKey, getStringValue]);

  const toggleSelect = (item: TItem) => {
    const id = getItemId(item);
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else if (canAddMore) {
      onChange([...value, id]);
    }
  };

  const removeId = (id: string) => {
    onChange(value.filter((x) => x !== id));
  };

  const renderBadges = () => (
    <div
      className={cn(
        "flex flex-wrap gap-2",
        badgePosition === "top" ? "mb-2" : "mt-2",
      )}
    >
      {selectedItems.map((item) => {
        const id = getItemId(item);
        const label = getItemLabel(item);
        const onRemove = () => removeId(id);
        return renderBadge ? (
          <React.Fragment key={id}>
            {renderBadge(item, onRemove)}
          </React.Fragment>
        ) : (
          <Badge key={id} variant="secondary" className="gap-1 rounded-lg">
            {label}
            <X
              className="h-3 w-3 cursor-pointer opacity-60 hover:opacity-100"
              onClick={onRemove}
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
              {value.length > 0 ? `${value.length} selezionati` : placeholder}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
              className="h-9"
            />
            <CommandList>
              {isLoading ? (
                <div className="flex items-center justify-center p-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                  <span className="ml-2 text-sm text-muted-foreground">
                    {loadingMessage}
                  </span>
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyMessage}</CommandEmpty>
                  <CommandGroup>
                    {filteredItems.map((item) => {
                      const id = getItemId(item);
                      const label = getItemLabel(item);
                      const isSelected = value.includes(id);
                      return (
                        <CommandItem
                          key={id}
                          value={id}
                          disabled={!isSelected && !canAddMore}
                          onSelect={() => toggleSelect(item)}
                        >
                          {renderItem ? (
                            renderItem(item, isSelected)
                          ) : (
                            <div
                              className={cn(
                                "flex w-full items-center justify-between",
                                isSelected && "font-medium",
                              )}
                            >
                              <span className="truncate">{label}</span>
                              {isSelected ? (
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

      {badgePosition === "bottom" && renderBadges()}
    </div>
  );
}
