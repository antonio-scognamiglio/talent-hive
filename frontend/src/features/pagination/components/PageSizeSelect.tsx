import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PageSizeSelectProps {
  /**
   * Array of available pageSize values
   * @example [10, 25, 50, 100]
   */
  pageSizes: number[];
  /**
   * Current selected value
   */
  value: number;
  /**
   * Callback called when value changes
   */
  onValueChange: (value: number) => void;
  /**
   * Optional label to show before the select
   * If not provided, no label is shown
   */
  label?: string;
  /**
   * Width of the select trigger
   * @default "w-[100px]"
   */
  triggerWidth?: string;
  /**
   * Optional CSS class for the container
   */
  className?: string;
  /**
   * Whether the component is disabled
   * @default false
   */
  disabled?: boolean;
}

/**
 * Reusable component for page size selection.
 * Does not include spacing - spacing must be managed by parent component.
 *
 * @example
 * <PageSizeSelect
 *   pageSizes={[10, 25, 50, 100]}
 *   value={pageSize}
 *   onValueChange={setPageSize}
 *   label="Items per page:"
 * />
 */
export function PageSizeSelect({
  pageSizes,
  value,
  onValueChange,
  label,
  triggerWidth = "w-[70px]",
  className,
  disabled = false,
}: PageSizeSelectProps) {
  return (
    <div className={className}>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
      <Select
        value={String(value)}
        onValueChange={(val) => onValueChange(Number(val))}
        disabled={disabled}
      >
        <SelectTrigger className={triggerWidth}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {pageSizes.map((size) => (
            <SelectItem key={size} value={String(size)}>
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
