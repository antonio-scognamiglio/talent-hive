import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const spinnerVariants = cva(
  "animate-spin rounded-full border-2 border-current border-t-transparent",
  {
    variants: {
      size: {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
      },
      variant: {
        default: "text-primary",
        muted: "text-muted-foreground",
        white: "text-white",
        accent: "text-accent",
      },
    },
    defaultVariants: {
      size: "md",
      variant: "default",
    },
  },
);

interface SpinnerProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
  message?: string;
  showMessage?: boolean;
}

export const Spinner = ({
  className,
  size,
  variant,
  message = "Loading...",
  showMessage = false,
  ...props
}: SpinnerProps) => {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-row items-center justify-center gap-3",
        className,
      )}
      {...props}
    >
      <div className={cn(spinnerVariants({ size, variant }))} />
      {showMessage ? (
        <span className="text-sm text-muted-foreground">{message}</span>
      ) : (
        <span className="sr-only">{message}</span>
      )}
    </div>
  );
};
