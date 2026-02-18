import { useState, useCallback, useRef } from "react";
import { Pencil, CheckCircle2, XCircle, Save, X } from "lucide-react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { Button } from "@/components/ui/button";
import { UpdateApplicationForm } from "../forms/UpdateApplicationForm";
import { ApplicationDetailView } from "./ApplicationDetailView";
import type { UpdateApplicationFormValues } from "../../schemas/update-application.schema";
import type { Application } from "@shared/types";
import {
  InlineConfirmationSuccess,
  InlineConfirmationDanger,
} from "@/features/shared/components/inline-actions";

type DialogMode = "view" | "edit";

interface ApplicationDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  application: Application;
  onUpdate: (id: string, data: UpdateApplicationFormValues) => Promise<void>;
  onHire: (id: string, notes?: string, score?: number) => Promise<void>;
  onReject: (
    id: string,
    reason?: string,
    notes?: string,
    score?: number,
  ) => Promise<void>;
  handleViewCv: (id: string) => Promise<void>;
  isUpdating: boolean;
  isHiring: boolean;
  isRejecting: boolean;
}

export function ApplicationDetailDialog({
  isOpen,
  onClose,
  application,
  onUpdate,
  onHire,
  onReject,
  handleViewCv,
  isUpdating,
  isHiring,
  isRejecting,
}: ApplicationDetailDialogProps) {
  const [mode, setMode] = useState<DialogMode>("view");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showHireAction, setShowHireAction] = useState(false);
  const [showRejectAction, setShowRejectAction] = useState(false);

  // Track form values in edit mode for "Save & Hire" logic
  const formValuesRef = useRef<Partial<UpdateApplicationFormValues>>({});

  const isDone = application.workflowStatus === "DONE";
  const formId = `update-application-form-${application.id}`;

  const handleEditClick = useCallback(() => {
    setMode("edit");
    // Reset form values ref when entering edit mode
    formValuesRef.current = {
      notes: application.notes ?? undefined,
      score: application.score ?? undefined,
      workflowStatus: application.workflowStatus,
    };
  }, [application]);

  const handleCancelEdit = useCallback(() => {
    setMode("view");
    setIsFormDirty(false);
    setShowHireAction(false);
    setShowRejectAction(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: UpdateApplicationFormValues) => {
      await onUpdate(application.id, data);
      setMode("view");
      setIsFormDirty(false);
    },
    [application.id, onUpdate],
  );

  // Stabilize callback to prevent infinite loops
  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsFormDirty(dirty);
  }, []);

  // Capture real-time values from form
  const handleValuesChange = useCallback(
    (values: Partial<UpdateApplicationFormValues>) => {
      formValuesRef.current = { ...formValuesRef.current, ...values };
    },
    [],
  );

  const handleClose = useCallback(() => {
    setMode("view");
    setIsFormDirty(false);
    setShowHireAction(false);
    setShowRejectAction(false);
    onClose();
  }, [onClose]);

  // --- Action Handlers ---

  const handleHireClick = () => {
    setShowHireAction(true);
    setShowRejectAction(false);
  };

  const handleRejectClick = () => {
    setShowRejectAction(true);
    setShowHireAction(false);
  };

  const handleCancelAction = () => {
    setShowHireAction(false);
    setShowRejectAction(false);
  };

  const handleHireConfirm = async () => {
    const notes = isFormDirty ? formValuesRef.current.notes : undefined;
    const score = isFormDirty ? formValuesRef.current.score : undefined;

    await onHire(application.id, notes, score);
    setShowHireAction(false);
    setIsFormDirty(false);
    onClose(); // Chiude il dialog dopo azione distruttiva
  };

  const handleRejectConfirm = async (reason?: string) => {
    const notes = isFormDirty ? formValuesRef.current.notes : undefined;
    const score = isFormDirty ? formValuesRef.current.score : undefined;

    await onReject(application.id, reason, notes, score);
    setShowRejectAction(false);
    setIsFormDirty(false);
    onClose(); // Chiude il dialog dopo azione distruttiva
  };

  // --- Footer Buttons ---

  const renderFooter = () => {
    if (isDone) {
      return (
        <Button variant="outline" size="sm" onClick={handleClose}>
          Chiudi
        </Button>
      );
    }

    if (showHireAction || showRejectAction) {
      if (showHireAction) {
        return (
          <div className="w-full">
            <InlineConfirmationSuccess
              isVisible={true}
              onCancel={handleCancelAction}
              onConfirm={handleHireConfirm}
              title="Conferma Assunzione"
              description={
                isFormDirty
                  ? "Attenzione: hai modifiche non salvate a Note/Valutazione. Verranno salvate e applicate se procedi."
                  : "Sei sicuro di voler assumere questo candidato? L'azione è irreversibile."
              }
              confirmButtonText={isFormDirty ? "Salva e Assumi" : "Assumi"}
              cancelButtonText="Annulla"
              isLoading={isHiring}
            />
          </div>
        );
      }

      if (showRejectAction) {
        return (
          <div className="w-full">
            <InlineConfirmationDanger
              isVisible={true}
              onCancel={handleCancelAction}
              onConfirm={handleRejectConfirm}
              title="Rifiuta Candidatura"
              description={
                isFormDirty
                  ? "Attenzione: modifiche non salvate verranno applicate. L'azione è irreversibile."
                  : "Sei sicuro di voler rifiutare questo candidato?"
              }
              confirmButtonText={isFormDirty ? "Salva e Rifiuta" : "Rifiuta"}
              cancelButtonText="Annulla"
              isLoading={isRejecting}
              showMessageField={true}
              messagePlaceholder="Motivo del rifiuto (opzionale)"
            />
          </div>
        );
      }
    }

    // Standard Buttons
    return (
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex gap-2">
          {mode === "view" ? (
            <Button variant="outline" size="sm" onClick={handleEditClick}>
              <Pencil className="h-4 w-4 mr-2" />
              Modifica
            </Button>
          ) : (
            <>
              {/* SAVE Button triggers form submit via ID */}
              <Button
                variant="default"
                size="sm"
                form={formId}
                type="submit"
                disabled={isUpdating || !isFormDirty}
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Salvataggio..." : "Salva"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                disabled={isUpdating}
              >
                <X className="h-4 w-4 mr-2" />
                Annulla
              </Button>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClose}
            className={mode === "edit" ? "hidden" : ""}
          >
            Chiudi
          </Button>

          {/* Always visible Hire/Reject logic */}
          <Button
            onClick={handleHireClick}
            className="bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Assumi
          </Button>

          <Button onClick={handleRejectClick} variant="destructive" size="sm">
            <XCircle className="h-4 w-4 mr-2" />
            Rifiuta
          </Button>
        </div>
      </div>
    );
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      header={{
        title:
          mode === "view"
            ? `${application.user?.firstName} ${application.user?.lastName}`
            : "Modifica Candidatura",
        description:
          mode === "view"
            ? application.job?.title || "Candidatura"
            : "Modifica workflow, valutazione e note",
      }}
      footer={renderFooter()}
      smartAutoClose={mode === "edit"}
      isSafeToAutoClose={!isFormDirty}
    >
      {mode === "view" ? (
        <ApplicationDetailView
          application={application}
          onViewCv={handleViewCv}
        />
      ) : (
        <div className="flex flex-col h-full">
          <div className="flex-1 min-h-0">
            <UpdateApplicationForm
              id={formId}
              application={application}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelEdit}
              isSubmitting={isUpdating}
              onDirtyChange={handleDirtyChange}
              onValuesChange={handleValuesChange}
              hideFooter={true}
            />
          </div>
        </div>
      )}
    </CustomDialog>
  );
}
