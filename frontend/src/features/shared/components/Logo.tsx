import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

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
  variant,
  className,
  alt = "TalentHive",
}: LogoProps) {
  const { resolvedTheme } = useTheme();

  // Se variant è esplicito usa quello, altrimenti usa il tema corrente
  // dark theme -> dark variant (che carica Icon-Dark.png = icona bianca)
  // light theme -> light variant (che carica Icon-Light.png = icona scura)
  // Fallback a "light" se resolvedTheme è undefined (safe default)
  const effectiveVariant =
    variant ?? (resolvedTheme === "dark" ? "dark" : "light");

  return (
    <img
      src={`/logo/TalentHive-Icon-${effectiveVariant === "dark" ? "Dark" : "Light"}.png`}
      alt={alt}
      className={cn("object-contain", className)}
      style={{ height: `${size}px`, width: "auto" }}
    />
  );
}
