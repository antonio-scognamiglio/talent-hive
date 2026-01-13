import { toast } from "sonner";

// Configurazione per la gestione dei messaggi di successo
export interface SuccessHandlerConfig {
  checkForResponseMessage?: boolean;
  checkForDataMessage?: boolean;
  checkForObjectMessage?: boolean;
}

// Funzione helper per controllare se un oggetto è valido
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isValidObject(obj: any): obj is Record<string, unknown> {
  return obj && typeof obj === "object" && obj !== null;
}

// Funzione helper per controllare se un oggetto ha una proprietà message
function hasMessageProperty(obj: unknown): string | null {
  if (
    isValidObject(obj) &&
    "message" in obj &&
    typeof obj.message === "string"
  ) {
    return obj.message;
  }
  return null;
}

// Funzione per estrarre il messaggio di successo
export function getSuccessMessage(
  response: unknown,
  defaultMessage: string,
  config: SuccessHandlerConfig = {}
): string {
  const {
    checkForResponseMessage: showIfFoundResponseMessage = true,
    checkForDataMessage: showIfFoundDataMessage = true,
    checkForObjectMessage: showIfFoundObjectMessage = true,
  } = config;

  // 1. Controlla se è una risposta API con data.message
  if (
    showIfFoundResponseMessage &&
    isValidObject(response) &&
    "data" in response
  ) {
    const dataMessage = hasMessageProperty(response.data);
    if (dataMessage) return dataMessage;
  }

  // 2. Controlla se è un oggetto con message diretto
  if (showIfFoundDataMessage) {
    const directMessage = hasMessageProperty(response);
    if (directMessage) return directMessage;
  }

  // 3. Controlla oggetto generico con message
  if (showIfFoundObjectMessage) {
    const genericMessage = hasMessageProperty(response);
    if (genericMessage) return genericMessage;
  }

  // 4. Fallback
  return defaultMessage;
}

// Funzione per gestire il successo e mostrare il toast
export function handleSuccess(
  response: unknown,
  defaultMessage: string,
  config: SuccessHandlerConfig = {},
  showToast: boolean = true
): string {
  const message = response
    ? getSuccessMessage(response, defaultMessage, config)
    : defaultMessage;

  if (showToast) {
    toast.success(message);
  }

  return message;
}
