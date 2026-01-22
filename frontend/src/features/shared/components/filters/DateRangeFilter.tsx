import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  formatDateForInput,
  parseDateInputToLocal,
} from "@/features/shared/utils/date.utils";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  startDate?: Date;
  endDate?: Date;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
  startLabel?: string;
  endLabel?: string;
  className?: string;
}

export function DateRangeFilter({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startLabel = "Da:",
  endLabel = "A:",
  className,
}: DateRangeFilterProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-2", className)}>
      <div className="flex items-center gap-2">
        <Label htmlFor="date-range-start" className="text-sm whitespace-nowrap">
          {startLabel}
        </Label>
        <Input
          id="date-range-start"
          type="date"
          value={formatDateForInput(startDate)}
          onChange={(e) => {
            if (e.target.value) {
              onStartDateChange(parseDateInputToLocal(e.target.value));
            } else {
              onStartDateChange(undefined);
            }
          }}
          className="w-36"
        />
      </div>
      <div className="flex items-center gap-2">
        <Label htmlFor="date-range-end" className="text-sm whitespace-nowrap">
          {endLabel}
        </Label>
        <Input
          id="date-range-end"
          type="date"
          value={formatDateForInput(endDate)}
          onChange={(e) => {
            if (e.target.value) {
              onEndDateChange(parseDateInputToLocal(e.target.value));
            } else {
              onEndDateChange(undefined);
            }
          }}
          className="w-36"
        />
      </div>
    </div>
  );
}
