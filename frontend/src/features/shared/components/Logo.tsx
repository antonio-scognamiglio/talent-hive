import { cn } from "@/lib/utils";

/**
 * Logo Component
 * Componente riutilizzabile per il logo Lex Nexus
 *
 * @example
 * <Logo size={32} />
 * <Logo size="h-8 w-8" variant="white" />
 */
export interface LogoProps {
  /** Dimensione del logo. Può essere un numero (in px) o una classe Tailwind (es. "h-8 w-8") */
  size?: number | string;

  /** Variante del logo */
  variant?: "colored" | "white" | "black";

  /** Classi CSS aggiuntive */
  className?: string;

  /** Alt text per accessibilità */
  alt?: string;
}

const LOGO_PATHS = {
  colored: "/logo/Lex-Nexus-Logo_Colored.png",
  white: "/logo/Lex-Nexus-Logo_Withe.png",
  black: "/logo/Lex-Nexus-Logo_Black.png",
} as const;

export function Logo({
  size = 32,
  variant = "colored",
  className,
  alt = "Lex Nexus Logo",
}: LogoProps) {
  // Se size è un numero, crea style inline. Altrimenti usa come className
  const sizeStyle =
    typeof size === "number"
      ? { width: `${size}px`, height: "auto" }
      : undefined;

  const sizeClass = typeof size === "string" ? size : undefined;

  return (
    <img
      src={LOGO_PATHS[variant]}
      alt={alt}
      className={cn(sizeClass, className)}
      style={sizeStyle}
    />
  );
}
