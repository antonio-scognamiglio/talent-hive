/**
 * ApplicationStatusFilter Component
 *
 * Filtro dropdown per finalDecision delle candidature (vista candidato).
 * Valori: Tutti, In attesa, Assunto, Rifiutato
 */

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ApplicationStatusFilterValue =
  | "all"
  | "pending"
  | "HIRED"
  | "REJECTED";

interface ApplicationStatusFilterProps {
  value: ApplicationStatusFilterValue;
  onChange: (value: ApplicationStatusFilterValue) => void;
  className?: string;
}

const STATUS_OPTIONS: {
  label: string;
  value: ApplicationStatusFilterValue;
}[] = [
  { label: "Tutti gli stati", value: "all" },
  { label: "In attesa", value: "pending" },
  { label: "Assunto", value: "HIRED" },
  { label: "Rifiutato", value: "REJECTED" },
];

export const ApplicationStatusFilter: React.FC<
  ApplicationStatusFilterProps
> = ({ value, onChange, className }) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as ApplicationStatusFilterValue)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Stato candidatura" />
      </SelectTrigger>
      <SelectContent>
        {STATUS_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
