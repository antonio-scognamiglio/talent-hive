import { cn } from "@/lib/utils";

/**
 * Title Component
 * Mostra un testo con gradiente CSS
 *
 * @example
 * <Title variant="dark" className="text-2xl">TalentHive</Title>
 * <Title variant="light" className="text-lg">My App</Title>
 */
export interface TitleProps {
  /** Testo da visualizzare */
  children: React.ReactNode;

  /** Variante colore (dark per sfondi scuri, light per sfondi chiari) */
  variant?: "dark" | "light";

  /** Classi CSS aggiuntive (usa classi Tailwind di testo per dimensione) */
  className?: string;
}

export function Title({ children, variant = "dark", className }: TitleProps) {
  // Gradiente basato sulla variante
  const gradientClass =
    variant === "dark"
      ? "bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6]" // Blu-viola vibrante per sfondi scuri
      : "bg-gradient-to-r from-[#1E293B] to-[#4C1D95]"; // Navy-viola scuro per sfondi chiari

  return (
    <span
      className={cn(
        "font-bold bg-clip-text text-transparent",
        gradientClass,
        className
      )}
    >
      {children}
    </span>
  );
}
