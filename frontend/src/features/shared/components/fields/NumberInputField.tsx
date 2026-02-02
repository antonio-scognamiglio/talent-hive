import { useCallback } from "react";
import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { normalizeNumberForForm } from "@/features/shared/utils/number.utils";

export interface NumberInputFieldProps<TForm extends FieldValues> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  /**
   * Prefix to display before the input (e.g., "€")
   */
  prefix?: string;
  /**
   * Step increment for number inputs (default: 1)
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
   * Maximum length of input (default: 9 for safe Int32)
   */
  maxLength?: number;
}

/**
 * NumberInputField Component
 *
 * Generic number input field for React Hook Form.
 * Wraps Shadcn Form components with number-specific handling.
 * Based on NumberFilter pattern but for form usage.
 *
 * @example
 * <NumberInputField
 *   control={control}
 *   name="salaryMin"
 *   label="Salario minimo"
 *   prefix="€"
 *   placeholder="30000"
 * />
 */
export function NumberInputField<TForm extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  readOnly,
  required,
  className,
  prefix,
  step = 1,
  min,
  max,
  maxLength = 9,
}: NumberInputFieldProps<TForm>) {
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
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          const rawValue = e.target.value;

          // Check maxLength
          if (rawValue.length > maxLength) return;

          // Validazione stretta (solo numeri)
          if (rawValue !== "" && !/^\d+$/.test(rawValue)) return;

          // Normalizza e passa a react-hook-form
          const normalized = normalizeNumberForForm(rawValue);
          field.onChange(normalized ?? "");
        };

        return (
          <FormItem className={className}>
            {label && (
              <FormLabel>
                {label}{" "}
                {required && <span className="text-destructive">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="relative">
                {prefix && (
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                    {prefix}
                  </span>
                )}
                <Input
                  type="number"
                  placeholder={placeholder}
                  disabled={disabled}
                  readOnly={readOnly}
                  value={field.value ?? ""}
                  onChange={handleChange}
                  onBlur={field.onBlur}
                  onKeyDown={handleKeyDown}
                  step={step}
                  min={min}
                  max={max}
                  className={prefix ? "pl-8" : undefined}
                />
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
}
