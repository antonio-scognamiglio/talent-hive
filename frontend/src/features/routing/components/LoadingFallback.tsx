import { Logo } from "@/features/shared/components/Logo";

/**
 * Loading Fallback Component
 * Componente di fallback per il lazy loading dei componenti
 */
export const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Logo size={48} className="mx-auto mb-4 animate-pulse" />
      <p className="text-lg text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);

/**
 * Compact Loading Fallback
 * Versione compatta per loading inline - si centra automaticamente
 */
export const CompactLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <Logo size={32} className="mx-auto mb-2 animate-pulse" />
      <p className="text-sm text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);

/**
 * Auth Loading Fallback
 * Loading specifico per il check dell'autenticazione
 */
export const AuthLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-background">
    <div className="text-center text-foreground">
      <Logo size={48} className="mx-auto mb-4 animate-pulse" />
      <p className="text-lg font-medium">Verifica autenticazione...</p>
    </div>
  </div>
);
