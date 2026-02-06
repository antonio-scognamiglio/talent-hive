import { useState, useCallback } from "react";
import { format } from "date-fns";
import {
  MapPin,
  FileText,
  Pencil,
  CheckCircle2,
  XCircle,
  Calendar,
} from "lucide-react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { UpdateApplicationForm } from "../forms/UpdateApplicationForm";
import type { UpdateApplicationFormValues } from "../../schemas/update-application.schema";
import type { Application } from "@shared/types";
import {
  InlineConfirmationSuccess,
  InlineConfirmationDanger,
} from "@/features/shared/components/inline-actions";
import {
  getApplicationStatusLabel,
  getFinalDecisionStatusColor,
  getFinalDecisionStatusLabel,
  getWorkflowStatusColor,
} from "../../utils/status.utils";

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
  // ... (unchanged hooks) ...
  // ... (unchanged hooks) ...
  const [mode, setMode] = useState<DialogMode>("view");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showHireAction, setShowHireAction] = useState(false);
  const [showRejectAction, setShowRejectAction] = useState(false);

  // Stabilize callback to prevent infinite loops in UpdateApplicationForm useEffect
  const handleDirtyChange = useCallback((dirty: boolean) => {
    setIsFormDirty(dirty);
  }, []);

  const isDone = application.workflowStatus === "DONE";

  const handleEditClick = useCallback(() => {
    setMode("edit");
  }, []);

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

  const handleHireClick = () => {
    setShowHireAction(true);
    setShowRejectAction(false);
  };

  const handleHireConfirm = async () => {
    await onHire(
      application.id,
      undefined, // Notes from form not passed directly in view mode logic
      undefined, // Score from form not passed directly in view mode logic
    );
    setShowHireAction(false);
  };

  const handleRejectClick = () => {
    setShowRejectAction(true);
    setShowHireAction(false);
  };

  const handleRejectConfirm = async (reason?: string) => {
    await onReject(application.id, reason, undefined, undefined);
    setShowRejectAction(false);
  };

  const handleCancelAction = () => {
    setShowHireAction(false);
    setShowRejectAction(false);
  };

  const handleClose = useCallback(() => {
    setMode("view");
    setIsFormDirty(false);
    setShowHireAction(false);
    setShowRejectAction(false);
    onClose();
  }, [onClose]);

  // VIEW Mode Content
  const viewContent = (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Candidate Info Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Candidato
              </h3>
              <p className="text-lg font-medium">
                {application.user?.firstName} {application.user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {application.user?.email}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Candidato il
              </h3>
              <p className="text-sm flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(application.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Posizione
            </h3>
            <p className="font-medium">{application.job?.title}</p>
            {application.job?.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {application.job.location}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              CV
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewCv(application.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Visualizza CV
            </Button>
          </div>

          {application.coverLetter && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Lettera di Presentazione
                </h3>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                  {application.coverLetter}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Workflow Status Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Status Candidatura
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                className={getWorkflowStatusColor(application.workflowStatus)}
              >
                {getApplicationStatusLabel(application.workflowStatus)}
              </Badge>
              {application.finalDecision && (
                <Badge
                  className={getFinalDecisionStatusColor(
                    application.finalDecision,
                  )}
                >
                  {getFinalDecisionStatusLabel(application.finalDecision)}
                </Badge>
              )}
            </div>
          </div>

          {application.score && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Valutazione
                </h3>
                <p className="text-amber-500 font-medium">
                  {"⭐".repeat(application.score)}
                  <span className="text-muted-foreground text-sm ml-2 font-normal">
                    ({application.score}/5)
                  </span>
                </p>
              </div>
            </>
          )}

          {application.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Note
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Final Actions (only if NOT DONE) */}
      {!isDone && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold mb-4">Decisione Finale</h3>

            <div className="space-y-3">
              {/* HIRE Inline Confirmation */}
              {showHireAction ? (
                <InlineConfirmationSuccess
                  isVisible={true}
                  onCancel={handleCancelAction}
                  onConfirm={handleHireConfirm}
                  title="Conferma Assunzione"
                  description={
                    <>
                      Sei sicuro di voler assumere questo candidato?
                      <div className="mt-2">L'azione è irreversibile.</div>
                    </>
                  }
                  confirmButtonText="Assumi"
                  cancelButtonText="Annulla"
                  isLoading={isHiring}
                />
              ) : (
                !showRejectAction && (
                  <Button
                    onClick={handleHireClick}
                    className="w-full justify-start bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Assumi Candidato
                  </Button>
                )
              )}

              {/* REJECT Inline Confirmation */}
              {showRejectAction ? (
                <InlineConfirmationDanger
                  isVisible={true}
                  onCancel={handleCancelAction}
                  onConfirm={handleRejectConfirm}
                  title="Rifiuta Candidatura"
                  description={
                    <>
                      Sei sicuro di voler rifiutare questo candidato?
                      <div className="mt-2">L'azione è irreversibile.</div>
                    </>
                  }
                  confirmButtonText="Rifiuta"
                  cancelButtonText="Annulla"
                  isLoading={isRejecting}
                  showMessageField={true}
                  messagePlaceholder="Motivo del rifiuto (opzionale)"
                />
              ) : (
                !showHireAction && (
                  <Button
                    onClick={handleRejectClick}
                    variant="destructive"
                    className="w-full justify-start"
                    size="lg"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Rifiuta Candidatura
                  </Button>
                )
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  // EDIT Mode Content
  // We need to inject the "Inline actions" at the bottom of edit mode too?
  // Plan says: "Actions: Salva | Annulla | Assumi | Rifiuta" in EDIT mode.
  // So yes, we should show them.
  // And if isDirty is true, the message changes.
  // We need to pass onValuesChange to capture dirty values.
  // I will add onValuesChange to UpdateApplicationForm props locally in the file update first?
  // Or I can modify UpdateApplicationForm to accept it.
  // For now I will assume I can modify it.
  const editContent = (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0">
        <UpdateApplicationForm
          application={application}
          onSubmit={handleFormSubmit}
          onCancel={handleCancelEdit}
          isSubmitting={isUpdating}
          onDirtyChange={handleDirtyChange}
        />
      </div>
    </div>
  );

  // VIEW Mode Footer
  const viewFooter = !isDone ? (
    <div className="flex items-center justify-between w-full">
      <Button variant="outline" size="sm" onClick={handleEditClick}>
        <Pencil className="h-4 w-4 mr-2" />
        Modifica
      </Button>
      <Button variant="outline" size="sm" onClick={handleClose}>
        Chiudi
      </Button>
    </div>
  ) : (
    <Button variant="outline" size="sm" onClick={handleClose}>
      Chiudi
    </Button>
  );

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
      footer={mode === "view" ? viewFooter : undefined}
      smartAutoClose={mode === "edit"}
      isSafeToAutoClose={!isFormDirty}
    >
      {mode === "view" ? viewContent : editContent}
    </CustomDialog>
  );
}
