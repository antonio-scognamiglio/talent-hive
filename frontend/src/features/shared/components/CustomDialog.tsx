import React, { useCallback, type JSX } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface CustomDialogProps extends React.PropsWithChildren {
  isOpen: boolean;
  onClose: () => void;
  /**
   * Abilita il comportamento intelligente per la chiusura automatica.
   * Quando true, il dialog blocca la chiusura automatica (click fuori, ESC) solo quando
   * `isSafeToAutoClose` è false, prevenendo la perdita di dati non salvati.
   * Richiede `isSafeToAutoClose` per funzionare correttamente.
   * @default false
   */
  smartAutoClose?: boolean;
  /**
   * Indica se è sicuro chiudere automaticamente il dialog senza perdere dati.
   * Se `smartAutoClose` è true:
   *   - Se `isSafeToAutoClose` è false → blocca click fuori ed ESC
   *   - Se `isSafeToAutoClose` è true o undefined → permette chiusura normale
   * Esempio: per un form, passa `!form.formState.isDirty` (false se ci sono modifiche).
   * @default undefined
   */
  isSafeToAutoClose?: boolean;
  /**
   * Header del dialog. Due formati disponibili:
   *
   * 1. Formato oggetto (consigliato - accessibilità garantita):
   *    { title, description, wrapper? }
   *    - title e description sono obbligatori e vengono wrappati automaticamente
   *    - wrapper è opzionale (componente o tipo elemento come "div")
   *
   * 2. Formato ReactNode (massima flessibilità):
   *    DEVE contenere DialogTitle e DialogDescription per accessibilità
   *
   * @example
   * // Formato oggetto (consigliato)
   * header={{
   *   title: "Dettaglio Proposta",
   *   description: <Link>Annuncio: Titolo</Link>,
   *   wrapper: "div" // o componente custom
   * }}
   *
   * @example
   * // Formato ReactNode (deve contenere DialogTitle e DialogDescription)
   * header={
   *   <div>
   *     <DialogTitle>Titolo</DialogTitle>
   *     <DialogDescription>Descrizione</DialogDescription>
   *   </div>
   * }
   */
  header:
    | React.ReactNode
    | {
        title: string | React.ReactNode;
        description: string | React.ReactNode;
        wrapper?:
          | keyof JSX.IntrinsicElements
          | React.ComponentType<{ children: React.ReactNode }>;
      };
  footer?:
    | React.ReactNode
    | {
        primaryButton?: {
          text: string;
          onClick: () => void;
          variant?:
            | "default"
            | "outline"
            | "secondary"
            | "destructive"
            | "ghost"
            | "link";
          disabled?: boolean;
        };
        secondaryButton?: {
          text: string;
          onClick: () => void;
          variant?:
            | "default"
            | "outline"
            | "secondary"
            | "destructive"
            | "ghost"
            | "link";
        };
      };
}

/**
 * CustomDialog - Dialog personalizzato con gestione intelligente dello scroll
 *
 * HEADER:
 * - Formato oggetto (consigliato): { title, description, wrapper? } → DialogTitle e DialogDescription aggiunti automaticamente
 * - Formato ReactNode: DEVI includere DialogTitle e DialogDescription dentro per accessibilità
 *
 * @example
 * // ✅ Formato oggetto (consigliato - accessibilità garantita)
 * <CustomDialog header={{
 *   title: "Titolo",
 *   description: "Descrizione",
 *   wrapper: "div" // opzionale
 * }}>
 *   ...
 * </CustomDialog>
 *
 * @example
 * // ✅ ReactNode (deve contenere DialogTitle e DialogDescription)
 * <CustomDialog
 *   header={
 *     <div>
 *       <DialogTitle>Titolo</DialogTitle>
 *       <DialogDescription>Descrizione</DialogDescription>
 *     </div>
 *   }
 * >
 *   ...
 * </CustomDialog>
 *
 * REGOLE D'ORO PER L'UTILIZZO:
 *
 * 1. CONTENUTO SEMPLICE:
 *    <CustomDialog>
 *      <div className="p-4">Contenuto normale</div>
 *    </CustomDialog>
 *
 * 2. CONTENUTO LUNGO (SCROLL INTERNO):
 *    <CustomDialog>
 *      <div className="h-full overflow-y-auto p-4">Contenuto lungo...</div>
 *    </CustomDialog>
 *
 * 3. LAYOUT COMPLESSO CON FOOTER FISSO (mettendo il footer dentro il content, utile per form):
 *    <CustomDialog>
 *      <div className="flex flex-col h-full">
 *        <div className="flex-1 min-h-0 overflow-y-auto p-4">Contenuto principale</div>
 *        <div className="shrink-0 border-t p-4">Footer fisso</div>
 *      </div>
 *    </CustomDialog>
 *
 * 4. LAYOUT CON SEZIONI MULTIPLE:
 *    <CustomDialog>
 *      <div className="flex flex-col h-full">
 *        <div className="flex-1 min-h-0 overflow-y-auto">Sezione 1</div>
 *        <div className="flex-1 min-h-0 overflow-y-auto">Sezione 2</div>
 *        <div className="flex-1 min-h-0 overflow-y-auto">Sezione 3</div>
 *      </div>
 *    </CustomDialog>
 *
 * IMPORTANTE:
 * - Il dialog NON scrolla mai (overflow-y-hidden)
 * - I children DEVONO gestire il proprio scroll
 * - Usa sempre min-h-0 sui container flex che contengono flex-1
 * - Usa h-full per contenitori che devono occupare tutto lo spazio
 */
export const CustomDialog: React.FC<CustomDialogProps> = ({
  isOpen,
  onClose,
  header,
  footer,
  children,
  smartAutoClose = false,
  isSafeToAutoClose,
}) => {
  const renderHeader = useCallback(() => {
    // Formato oggetto
    if (
      typeof header === "object" &&
      header !== null &&
      "title" in header &&
      "description" in header
    ) {
      // Determina se la description è un ReactNode (non una stringa)
      // Se è un ReactNode, usiamo asChild per permettere contenuti complessi (div, Badge, etc.)
      const isDescriptionReactNode =
        typeof header.description !== "string" &&
        typeof header.description !== "number" &&
        typeof header.description !== "boolean";

      const content = (
        <>
          <DialogTitle>{header.title}</DialogTitle>
          {isDescriptionReactNode ? (
            <DialogDescription asChild>
              <div>{header.description}</div>
            </DialogDescription>
          ) : (
            <DialogDescription>{header.description}</DialogDescription>
          )}
        </>
      );

      if (header.wrapper) {
        const Wrapper = header.wrapper;
        return <Wrapper>{content}</Wrapper>;
      }

      return content;
    }

    // Formato ReactNode (l'utente deve aver incluso DialogTitle e DialogDescription)
    return header;
  }, [header]);

  const renderFooter = useCallback(() => {
    if (!footer) return null;

    // Controlla se è un oggetto con primaryButton O secondaryButton
    if (
      typeof footer === "object" &&
      footer !== null &&
      ("primaryButton" in footer || "secondaryButton" in footer)
    ) {
      return (
        <DialogFooter className="flex justify-end gap-2 border-t pt-4">
          {footer.secondaryButton && (
            <Button
              variant={footer.secondaryButton.variant || "outline"}
              onClick={footer.secondaryButton.onClick}
            >
              {footer.secondaryButton.text}
            </Button>
          )}
          {footer.primaryButton && (
            <Button
              variant={footer.primaryButton.variant || "default"}
              onClick={footer.primaryButton.onClick}
              disabled={footer.primaryButton.disabled}
            >
              {footer.primaryButton.text}
            </Button>
          )}
        </DialogFooter>
      );
    }

    return (
      <DialogFooter className="border-t pt-4">
        {footer as React.ReactNode}
      </DialogFooter>
    );
  }, [footer]);

  // Determina se bloccare la chiusura automatica
  // Blocca se: smartAutoClose è true E isSafeToAutoClose è false (non è sicuro chiudere)
  const shouldBlockAutoClose = smartAutoClose && isSafeToAutoClose === false;

  // Previene la chiusura quando si clicca fuori
  // Quando si blocca onInteractOutside, il click fuori non chiama più onOpenChange
  const handleInteractOutside = useCallback(
    (event: Event) => {
      if (shouldBlockAutoClose) {
        event.preventDefault();
      }
    },
    [shouldBlockAutoClose],
  );

  // Previene la chiusura quando si preme ESC
  // Quando si blocca onEscapeKeyDown, ESC non chiama più onOpenChange
  const handleEscapeKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (shouldBlockAutoClose) {
        event.preventDefault();
      }
    },
    [shouldBlockAutoClose],
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="grid! grid-rows-[auto_1fr_auto]! gap-0! w-[95vw] max-w-[95vw] sm:w-[80vw] sm:max-w-[80vw] md:w-[70vw] md:max-w-[70vw] lg:w-[70vw] lg:max-w-[70vw] xl:w-[65vw] xl:max-w-[65vw] h-[85vh] max-h-[85vh] p-4"
        onInteractOutside={handleInteractOutside}
        onEscapeKeyDown={handleEscapeKeyDown}
      >
        {/* Header fisso - non si riduce mai */}
        <DialogHeader className="shrink-0 py-4 px-4 border-b">
          {renderHeader()}
        </DialogHeader>

        {/* 
          CONTENUTO PRINCIPALE - REGOLE D'ORO:
          
          1. overflow-y-hidden: Il dialog NON scrolla mai - evita doppio scroll
          2. flex flex-col: Crea contenitore flessibile per children
          3. min-h-0: Permette ai children di contrarsi sotto la loro dimensione naturale
          
          I CHILDREN DEVONO GESTIRE IL PROPRIO SCROLL:
          - Per contenuto semplice: <div className="p-4">Contenuto</div>
          - Per contenuto lungo: <div className="h-full overflow-y-auto p-4">Contenuto lungo...</div>
          - Per layout complesso: <div className="flex flex-col h-full"><div className="flex-1 min-h-0 overflow-y-auto">...</div></div>
          
          PATTERN RACCOMANDATI:
          ✅ <div className="h-full overflow-y-auto p-4">Contenuto scrollabile</div>
          ✅ <div className="flex flex-col h-full"><div className="flex-1 min-h-0 overflow-y-auto">...</div></div>
          ❌ Non mettere overflow-y-auto sul dialog stesso
        */}
        <div className="min-h-0 flex flex-col overflow-y-hidden">
          {children}
        </div>

        {/* Footer fisso - non si riduce mai */}
        {renderFooter()}
      </DialogContent>
    </Dialog>
  );
};
