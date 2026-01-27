import { useState, useEffect, useRef, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  normalizeNumber,
  normalizeNumberForForm,
} from "@/features/shared/utils/number.utils";

interface NumberFilterProps {
  placeholder?: string;
  onChange: (value: number | undefined) => void;
  debounceMs?: number;
  className?: string;
  value?: number;
  /**
   * Prefix to display before numbers (e.g., "$", "€")
   */
  prefix?: string;
  /**
   * Step increment for number inputs (default: 1000)
   */
  step?: number;
  /**
   * Minimum allowed value
   */
  min?: number;
  /**
   * Maximum allowed value
   */
  max?: number;
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * Maximum length of input (default: 9 for safe Int32)
   */
  maxLength?: number;
}

/**
 * NumberFilter Component
 *
 * Componente riutilizzabile per input numerico con debounce.
 * Gestisce automaticamente il debounce e fornisce un pulsante per cancellare.
 * Segue lo stesso pattern di SearchInput.
 *
 * @example
 * <NumberFilter
 *   placeholder="Salario minimo"
 *   value={salaryMin}
 *   onChange={(value) => handleSalaryMinChange(value)}
 *   prefix="€"
 *   step={1000}
 *   debounceMs={500}
 * />
 */
export function NumberFilter({
  placeholder = "Numero...",
  onChange: controlledOnChange,
  debounceMs = 500,
  className,
  value: controlledValue,
  prefix,
  step = 1000,
  min,
  max,
  disabled = false,
  maxLength = 9,
}: NumberFilterProps) {
  const [localValue, setLocalValue] = useState<number | "">(
    controlledValue ?? "",
  );
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 1. Helper per schedulare il debounce
  const scheduleDebouncedUpdate = useCallback(
    (val: number | "") => {
      // Pulisci timer precedente
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Schedula nuovo timer
      debounceTimerRef.current = setTimeout(() => {
        const normalizedNumber = normalizeNumber(val, 0, true);
        controlledOnChange(normalizedNumber);
      }, debounceMs);
    },
    [controlledOnChange, debounceMs],
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
      const rawValue = e.target.value;

      // Check maxLength
      if (rawValue.length > maxLength) return;

      // Validazione stretta (solo numeri)
      if (rawValue !== "" && !/^\d+$/.test(rawValue)) return;

      const normalized = normalizeNumberForForm(rawValue);
      const newValue = normalized ?? "";

      // Aggiorna UI subito
      setLocalValue(newValue);

      // Triggera debounce per il parent
      scheduleDebouncedUpdate(newValue);
    },
    [maxLength, scheduleDebouncedUpdate],
  );

  // 4. HandleClear immediato
  const handleClear = useCallback(() => {
    setLocalValue("");
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    controlledOnChange(undefined); // Clear immediato!
  }, [controlledOnChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Lista di tasti consentiti (navigazione, editing)
    const allowedKeys = [
      "Backspace",
      "Tab",
      "Enter",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
    ];

    // Se è un tasto di controllo o un numero, ok
    if (allowedKeys.includes(e.key) || /^[0-9]$/.test(e.key)) {
      return;
    }

    // Blocca tutto il resto (lettere, simboli, -, +, ., e, E)
    e.preventDefault();
  }, []);

  return (
    <div
      className={cn(
        "flex items-center gap-1 bg-background rounded-md border h-10 px-3 w-full focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
        className,
      )}
    >
      {prefix && (
        <span className="text-sm text-muted-foreground pointer-events-none shrink-0">
          {prefix}
        </span>
      )}
      <Input
        type="number"
        placeholder={placeholder}
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        step={step}
        min={min}
        max={max}
        disabled={disabled}
        className="border-0 p-0 h-9 focus-visible:ring-0 focus-visible:ring-offset-0 px-1 shadow-none"
      />
      <Button
        className="hover:bg-transparent border-none hover:text-muted-foreground p-0"
        variant="outline"
        size="sm"
        onClick={handleClear}
        disabled={!localValue || disabled}
      >
        <X className="h-2 w-2" />
      </Button>
    </div>
  );
}
