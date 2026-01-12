import type { ReactNode } from "react";
import { ThemeToggle } from "@/features/shared/components/ThemeToggle";

interface GuestLayoutProps {
  children: ReactNode;
}

/**
 * Guest Layout
 * Layout per pagine pubbliche/non autenticate
 *
 * Struttura:
 * - Header: Logo + ThemeToggle (+ future: LanguageSelector)
 * - Main: Content centrato verticalmente
 * - Footer: Opzionale (futuro)
 */
export function GuestLayout({ children }: GuestLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">TalentHive</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {/* Future: <LanguageSelector /> */}
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>

      {/* Footer - Optional (futuro) */}
    </div>
  );
}
