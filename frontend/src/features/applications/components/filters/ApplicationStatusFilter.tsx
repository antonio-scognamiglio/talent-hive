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

import {
  type FinalDecisionStatusFilterValue,
  APPLICATION_STATUS_FILTER_OPTIONS,
} from "../../constants/applications-options";

interface ApplicationStatusFilterProps {
  value: FinalDecisionStatusFilterValue;
  onChange: (value: FinalDecisionStatusFilterValue) => void;
  className?: string;
}

export const ApplicationStatusFilter: React.FC<
  ApplicationStatusFilterProps
> = ({ value, onChange, className }) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as FinalDecisionStatusFilterValue)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Stato candidatura" />
      </SelectTrigger>
      <SelectContent>
        {APPLICATION_STATUS_FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
