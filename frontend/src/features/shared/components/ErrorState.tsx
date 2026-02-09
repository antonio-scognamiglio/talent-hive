/**
 * ErrorState Component
 *
 * Stato di errore per liste e pagine quando un caricamento fallisce.
 * Mostra icona errore, messaggio, e pulsante retry.
 *
 * Usa questo invece di EmptyState quando isError === true.
 */

import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  /** Titolo dell'errore (default: "Errore di caricamento") */
  title?: string;
  /** Descrizione dell'errore */
  description?: string;
  /** Callback per retry/refetch */
  onRetry?: () => void;
  /** Testo del pulsante retry (default: "Riprova") */
  retryText?: string;
  /** Icona custom (default: AlertCircle) */
  icon?: React.ReactNode;
  /** Classe CSS aggiuntiva */
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = "Errore di caricamento",
  description = "Si è verificato un errore durante il caricamento dei dati.",
  onRetry,
  retryText = "Riprova",
  icon,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      <div className="mb-4 text-destructive">
        {icon ?? <AlertCircle className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{description}</p>
      {onRetry && (
        <Button
          variant="outline"
          onClick={onRetry}
          className="flex items-center gap-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          {retryText}
        </Button>
      )}
    </div>
  );
};
