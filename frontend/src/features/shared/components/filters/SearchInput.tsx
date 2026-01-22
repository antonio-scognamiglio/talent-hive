import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchInputProps {
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  debounceMs?: number;
  className?: string;
  value?: string;
}

/**
 * SearchInput Component
 *
 * Componente riutilizzabile per input di ricerca con debounce.
 * Gestisce automaticamente il debounce e fornisce un'icona di ricerca e un pulsante per cancellare.
 * Pattern event-driven (senza useEffect passivi).
 *
 * @example
 * <SearchInput
 *   placeholder="Cerca..."
 *   onSearch={(term) => handleSearch(term)}
 *   debounceMs={500}
 * />
 */
export function SearchInput({
  placeholder = "Cerca...",
  onSearch,
  debounceMs = 500,
  className,
  value: controlledValue,
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(controlledValue || "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Helper per schedulare il debounce
  const scheduleDebouncedUpdate = useCallback(
    (val: string) => {
      // Pulisci timer precedente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedula nuovo timer
      debounceTimerRef.current = setTimeout(() => {
        onSearch(val);
      }, debounceMs);
    },
    [onSearch, debounceMs],
  );

  // 2. Cleanup del timer all'unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 3. HandleChange che chiama l'update schedulato
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      // Aggiorna UI subito
      setSearchTerm(newValue);

      // Triggera debounce per il parent
      scheduleDebouncedUpdate(newValue);
    },
    [scheduleDebouncedUpdate],
  );

  // 4. HandleClear immediato
  const handleClear = useCallback(() => {
    setSearchTerm("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onSearch(""); // Clear immediato!
  }, [onSearch]);

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background rounded-md border h-10 px-3 w-full",
        className,
      )}
    >
      <Search className="h-4 w-4 text-muted-foreground shrink-0" />
      <Input
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleChange}
        className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full"
      />
      <Button
        className="hover:bg-transparent border-none hover:text-muted-foreground p-0"
        variant="outline"
        size="sm"
        onClick={handleClear}
        disabled={!searchTerm}
      >
        <X className="h-2 w-2" />
      </Button>
    </div>
  );
}
