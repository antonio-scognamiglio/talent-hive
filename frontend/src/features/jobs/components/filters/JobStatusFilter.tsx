import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  JOB_STATUS_LABELS,
  getJobStatusLabel,
} from "@/features/jobs/utils/job-status.utils";

interface JobStatusFilterProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
  className?: string;
}

const ALL_STATUS_VALUE = "all";

export const JobStatusFilter: React.FC<JobStatusFilterProps> = ({
  value,
  onChange,
  className,
}) => {
  return (
    <Select
      value={value || ALL_STATUS_VALUE}
      onValueChange={(val) =>
        onChange(val === ALL_STATUS_VALUE ? undefined : val)
      }
    >
      <SelectTrigger className={cn("w-full", className)}>
        <SelectValue placeholder="Filtra per stato" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL_STATUS_VALUE}>Tutti gli stati</SelectItem>
        {Object.keys(JOB_STATUS_LABELS).map((status) => (
          <SelectItem key={status} value={status}>
            {getJobStatusLabel(status)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
