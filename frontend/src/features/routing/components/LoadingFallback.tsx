import { Logo } from "@/features/shared/components";

interface LoadingFallbackProps {
  /**
   * Message to display while loading
   * @default "Loading..."
   */
  message?: string;
}

/**
 * Loading Fallback Component
 * Full-screen loading indicator for route lazy loading and auth checks
 */
export const LoadingFallback = ({
  message = "Verifica autenticazione...",
}: LoadingFallbackProps) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="text-center">
      <Logo size={48} className="mx-auto mb-4 animate-pulse" />
      <p className="text-lg text-muted-foreground">{message}</p>
    </div>
  </div>
);

/**
 * Compact Loading Fallback
 * Compact version for route lazy loading
 */
export const CompactLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-full w-full">
    <div className="text-center">
      <Logo size={32} className="mx-auto mb-4 animate-pulse" />
      <p className="text-sm text-muted-foreground">Caricamento...</p>
    </div>
  </div>
);
