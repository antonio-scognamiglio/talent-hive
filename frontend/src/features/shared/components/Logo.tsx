import { cn } from "@/lib/utils";

/**
 * Logo Component
 * Mostra l'icona esagonale di TalentHive
 *
 * @example
 * <Logo size={48} variant="dark" />
 * <Logo size={32} variant="light" />
 */
export interface LogoProps {
  /** Dimensione del logo (in px) */
  size?: number;

  /** Variante colore (dark per sfondi scuri, light per sfondi chiari) */
  variant?: "dark" | "light";

  /** Classi CSS aggiuntive */
  className?: string;

  /** Alt text per accessibilità */
  alt?: string;
}

export function Logo({
  size = 48,
  variant = "dark",
  className,
  alt = "TalentHive",
}: LogoProps) {
  return (
    <img
      src={`/logo/TalentHive-Icon-${variant === "dark" ? "Dark" : "Light"}.png`}
      alt={alt}
      className={cn("object-contain", className)}
      style={{ height: `${size}px`, width: "auto" }}
    />
  );
}
