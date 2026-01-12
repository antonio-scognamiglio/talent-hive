import { Loader2 } from "lucide-react";

/**
 * Loading Fallback Component
 * Componente di fallback per il lazy loading dei componenti
 */
export const LoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
      <p className="text-lg text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);

/**
 * Auth Loading Fallback
 * Loading specifico per il check dell'autenticazione
 */
export const AuthLoadingFallback: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
      <p className="text-lg font-medium">Verifica autenticazione...</p>
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
      <Loader2 className="mx-auto mb-2 h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);
