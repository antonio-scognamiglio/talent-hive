import { useState, useEffect, useRef } from "react";
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
  onChange?: (value: string) => void;
}

/**
 * SearchInput Component
 *
 * Componente riutilizzabile per input di ricerca con debounce.
 * Gestisce automaticamente il debounce e fornisce un'icona di ricerca e un pulsante per cancellare.
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
  onChange: controlledOnChange,
}: SearchInputProps) {
  const [searchTerm, setSearchTerm] = useState(controlledValue || "");
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sincronizza con valore controllato se fornito
  useEffect(() => {
    if (controlledValue !== undefined) {
      setSearchTerm(controlledValue);
    }
  }, [controlledValue]);

  // Debounce effect
  useEffect(() => {
    // Pulisci il timer precedente
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Imposta un nuovo timer
    debounceTimerRef.current = setTimeout(() => {
      onSearch(searchTerm);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchTerm, onSearch, debounceMs]);

  // Chiama onSearch immediatamente quando il componente viene montato con valore vuoto
  // per assicurarsi che i filtri vengano resettati
  useEffect(() => {
    if (searchTerm === "") {
      onSearch("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    if (controlledOnChange) {
      controlledOnChange(newValue);
    }
  };

  const handleClear = () => {
    setSearchTerm("");
    if (controlledOnChange) {
      controlledOnChange("");
    }
    // Chiama immediatamente onSearch con stringa vuota per rimuovere i filtri
    onSearch("");
  };

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
      {searchTerm && (
        <Button
          className="hover:bg-transparent border-none hover:text-muted-foreground p-0"
          variant="outline"
          size="sm"
          onClick={handleClear}
        >
          <X className="h-2 w-2" />
        </Button>
      )}
    </div>
  );
}
