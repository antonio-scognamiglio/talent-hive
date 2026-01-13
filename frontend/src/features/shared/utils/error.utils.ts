import { AxiosError } from "axios";
import { toast } from "sonner";

// Configurazione per la gestione degli errori
export interface ErrorHandlerConfig {
  checkForAxiosMessage?: boolean;
  checkForErrorMessage?: boolean;
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

// Funzione helper per controllare se un oggetto ha una proprietà code
function hasCodeProperty(obj: unknown): string | null {
  if (
    isValidObject(obj) &&
    "code" in obj &&
    (typeof obj.code === "string" || typeof obj.code === "number")
  ) {
    return String(obj.code);
  }
  return null;
}

// Funzione per estrarre il messaggio di errore
export function getErrorMessage(
  error: unknown,
  defaultMessage: string,
  config: ErrorHandlerConfig = {}
): string {
  const {
    checkForAxiosMessage: showIfFoundAxiosMessage = true,
    checkForErrorMessage: showIfFoundErrorMessage = true,
    checkForObjectMessage: showIfFoundObjectMessage = true,
  } = config;

  // 1. Controlla se è un errore Axios
  if (showIfFoundAxiosMessage && error instanceof AxiosError) {
    // Controlla errore wrappato da Axios (error.error.message)
    if ("error" in error) {
      const wrappedMessage = hasMessageProperty(error.error);
      if (wrappedMessage) return wrappedMessage;
    }

    // Controlla response.data.message (per errori con risposta dal server)
    if (error.response?.data) {
      const responseMessage = hasMessageProperty(error.response.data);
      if (responseMessage) return responseMessage;
    }
  }

  // 2. Controlla se è un Error standard
  if (showIfFoundErrorMessage && error instanceof Error && error.message) {
    return error.message;
  }

  // 3. Controlla oggetto generico con message
  if (showIfFoundObjectMessage) {
    const genericMessage = hasMessageProperty(error);
    if (genericMessage) return genericMessage;
  }

  // 4. Fallback
  return defaultMessage;
}

// Funzione per estrarre il codice di errore (status code HTTP)
export function getErrorCode(
  error: unknown,
  defaultCode: string | null = null,
  config: ErrorHandlerConfig = {}
): string | null {
  const {
    checkForAxiosMessage: showIfFoundAxiosCode = true,
    checkForErrorMessage: showIfFoundErrorCode = true,
    checkForObjectMessage: showIfFoundObjectCode = true,
  } = config;

  // 1. Controlla se è un errore Axios con risposta (status code HTTP)
  if (showIfFoundAxiosCode && error instanceof AxiosError) {
    // Priorità: response.status (status code HTTP come 403, 404, 500)
    if (error.response?.status) {
      return String(error.response.status);
    }
  }

  // 2. Controlla se è un Error standard con code
  if (showIfFoundErrorCode && error instanceof Error && "code" in error) {
    const errorCode = hasCodeProperty(error);
    if (errorCode) return errorCode;
  }

  // 3. Controlla oggetto generico con code
  if (showIfFoundObjectCode) {
    const genericCode = hasCodeProperty(error);
    if (genericCode) return genericCode;
  }

  // 4. Fallback
  return defaultCode;
}

// Funzione per gestire l'errore e mostrare il toast
export function handleError(
  error: unknown,
  defaultMessage: string,
  config: ErrorHandlerConfig = {},
  showToast: boolean = true
): string {
  const message = getErrorMessage(error, defaultMessage, config);

  if (showToast) {
    toast.error(message);
  }

  return message;
}
