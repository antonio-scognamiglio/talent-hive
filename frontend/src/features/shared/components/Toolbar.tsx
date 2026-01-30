/**
 * Toolbar Component
 *
 * Toolbar riutilizzabile con layout responsive.
 * Supporta contenuto custom a sinistra e a destra.
 * Può essere usato con o senza wrapper styled (card o plain).
 *
 * @example
 * // Con wrapper card (stile timesheet)
 * <Toolbar
 *   leftContent={<div>Filtri</div>}
 *   rightContent={<Button>Action</Button>}
 *   variant="card"
 * />
 *
 * @example
 * // Senza wrapper (stile filtri pagine)
 * <Toolbar
 *   leftContent={<SearchInput />}
 *   rightContent={<PrimaryButton text="Crea" />}
 *   variant="plain"
 * />
 *
 * @example
 * // Solo leftContent (filtri senza pulsanti)
 * <Toolbar
 *   leftContent={<SearchInput />}
 *   variant="plain"
 * />
 */

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ToolbarProps {
  /** Contenuto a sinistra: filtri, search, controlli navigazione, o custom */
  leftContent?: ReactNode;
  /** Contenuto a destra: pulsanti, refresh button, o custom (opzionale) */
  rightContent?: ReactNode;
  /** Variante del toolbar: "card" con wrapper styled, "plain" senza wrapper */
  variant?: "card" | "plain";
  /** Classi CSS aggiuntive per il container */
  className?: string;
  /** Classi CSS per il contenuto a sinistra */
  leftClassName?: string;
  /** Classi CSS per il contenuto a destra */
  rightClassName?: string;
}

export function Toolbar({
  leftContent,
  rightContent,
  variant = "card",
  className,
  leftClassName,
  rightClassName,
}: ToolbarProps) {
  // Se variant è "plain", non wrappare in un div styled
  if (variant === "plain") {
    return (
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          rightContent ? "justify-between" : "",
          className,
        )}
      >
        {/* Contenuto a sinistra */}
        <div
          className={cn(
            "flex flex-wrap items-center gap-2",
            rightContent ? "" : "flex-1",
            leftClassName,
          )}
        >
          {leftContent}
        </div>

        {/* Contenuto a destra (solo se presente) */}
        {rightContent && (
          <div
            className={cn("flex flex-wrap items-center gap-2", rightClassName)}
          >
            {rightContent}
          </div>
        )}
      </div>
    );
  }

  // Variante "card" con wrapper styled (comportamento originale)
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-4 mb-4 p-4 bg-card border rounded-lg",
        className,
      )}
    >
      {/* Contenuto a sinistra */}
      <div className={cn("flex items-center gap-2", leftClassName)}>
        {leftContent}
      </div>

      {/* Contenuto a destra */}
      {rightContent && (
        <div
          className={cn("flex flex-wrap items-center gap-2", rightClassName)}
        >
          {rightContent}
        </div>
      )}
    </div>
  );
}
