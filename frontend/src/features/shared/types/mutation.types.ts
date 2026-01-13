/**
 * Configurazione per una singola operazione di mutation
 */
export interface MutationOperationConfig {
  /** Se refetchare la query dopo il successo della mutation */
  refetchOnSuccess?: boolean;
  showSuccessToast?: boolean;
  /** Callback chiamato dopo il successo, riceve i dati della risposta */
  onSuccess?: (data?: unknown) => void;

  /** Chiamato PRIMA che la mutation inizi (utile per resettare errori) */
  onMutate?: () => void;

  /** Se gestire automaticamente gli errori con handleError */
  showErrorToast?: boolean;
  onError?: (error: unknown) => void;
}

/**
 * Mappa configurazioni per multiple mutations
 *
 * @template TOperations - Union type dei nomi delle operazioni (es. "createFirm" | "updateFirm")
 *
 * @example
 * type FirmsConfig = MutationConfigMap<"createFirm" | "updateFirm">;
 *
 * const config: FirmsConfig = {
 *   createFirm: { refetchOnSuccess: true, showErrorToast: false },
 *   updateFirm: { refetchOnSuccess: true },
 * };
 */
export type MutationConfigMap<TOperations extends string> = {
  [K in TOperations]?: MutationOperationConfig;
};
