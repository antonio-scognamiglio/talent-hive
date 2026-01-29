import { Spinner } from "./Spinner";
import { cn } from "@/lib/utils";

interface InputLoadingProps {
  message: string;
  className?: string;
  height?: "sm" | "md" | "lg" | "auto";
  /**
   * Variante del componente:
   * - "default": Usa quando vuoi sostituire completamente un Input/Select durante il loading.
   *   Ha border, background e padding. Esempio: in CityField per sostituire gli Input.
   * - "inline": Usa quando vuoi mostrare il loading DENTRO un componente esistente
   *   (es. dentro SelectTrigger, Button, ecc.) mantenendo le dimensioni del container.
   *   Non ha border/background, solo spinner e messaggio.
   */
  variant?: "default" | "inline";
}

const heightClasses = {
  sm: "h-9",
  md: "h-10",
  lg: "h-12",
  auto: "h-auto",
};

export const InputLoading = ({
  message,
  className = "",
  height = "md",
  variant = "default",
}: InputLoadingProps) => {
  const isInline = variant === "inline";

  return (
    <div
      className={cn(
        "flex items-center space-x-2",
        !isInline && "px-3 py-2 rounded-md border border-input bg-muted",
        !isInline && heightClasses[height],
        isInline && "w-full",
        className
      )}
    >
      <Spinner size="sm" variant="muted" className="h-3 w-3" />
      <span className="text-sm text-muted-foreground">{message}</span>
    </div>
  );
};
