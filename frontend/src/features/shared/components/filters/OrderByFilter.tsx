import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface OrderByOption<T extends string = string> {
  label: string;
  value: T;
}

interface OrderByFilterProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: OrderByOption<T>[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function OrderByFilter<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Ordina per...",
  className,
  disabled = false,
}: OrderByFilterProps<T>) {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as T)}
      disabled={disabled}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
