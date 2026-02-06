import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import {
  type WorkflowStatusFilterValue,
  WORKFLOW_STATUS_FILTER_OPTIONS,
} from "../../constants/applications-options";

export interface WorkflowStatusFilterProps {
  value: WorkflowStatusFilterValue;
  onChange: (value: WorkflowStatusFilterValue) => void;
  className?: string;
}

export const WorkflowStatusFilter: React.FC<WorkflowStatusFilterProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <Select
      value={value}
      onValueChange={(val) => onChange(val as WorkflowStatusFilterValue)}
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Stato candidatura" />
      </SelectTrigger>
      <SelectContent>
        {WORKFLOW_STATUS_FILTER_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
