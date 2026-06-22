import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Trash2,
  Users,
  MapPin,
  DollarSign,
  Calendar,
} from "lucide-react";
import type { JobWithCount } from "@/features/jobs/types/job.types";
import type { UpdateJobFormValues } from "@/features/jobs/schemas/update-job.schema";
import { toUpdateJobDto } from "@/features/jobs/schemas/update-job.schema";
import { UpdateJobForm } from "@/features/jobs/components/forms/UpdateJobForm";
import {
  getJobStatusVariant,
  getJobStatusLabel,
} from "@/features/jobs/utils/job-status.utils";
import {
  canArchiveJob,
  canEditJob,
} from "@/features/jobs/utils/job-permissions.utils";
import { InlineConfirmationDanger } from "@/features/shared/components/inline-actions";
import { formatDate } from "@/features/shared/utils/date.utils";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

type DialogMode = "view" | "edit";

interface JobDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobWithCount;
  onUpdate: (
    id: string,
    data: ReturnType<typeof toUpdateJobDto>,
  ) => Promise<void>;
  onArchive: (id: string) => Promise<void>;
  isUpdating?: boolean;
  isArchiving?: boolean;
}

export function JobDetailDialog({
  isOpen,
  onClose,
  job,
  onUpdate,
  onArchive,
  isUpdating = false,
  isArchiving = false,
}: JobDetailDialogProps) {
  const { user } = useAuthContext();

  const [mode, setMode] = useState<DialogMode>("view");
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);

  const canEdit = user ? canEditJob(job, user) : false;
  const canArchive = user ? canArchiveJob(job, user) : false;

  const handleEditClick = useCallback(() => {
    setMode("edit");
  }, []);

  const handleCancelEdit = useCallback(() => {
    setMode("view");
    setIsFormDirty(false);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: UpdateJobFormValues) => {
      const dto = toUpdateJobDto(data);
      await onUpdate(job.id, dto);
      setMode("view");
      setIsFormDirty(false);
    },
    [job.id, onUpdate],
  );

  const handleArchiveClick = useCallback(() => {
    setShowArchiveConfirm(true);
  }, []);

  const handleCancelArchive = useCallback(() => {
    setShowArchiveConfirm(false);
  }, []);

  const handleArchiveConfirm = useCallback(async () => {
    await onArchive(job.id);
    setShowArchiveConfirm(false);
  }, [job.id, onArchive]);

  const handleClose = useCallback(() => {
    setMode("view");
    setIsFormDirty(false);
    setShowArchiveConfirm(false);
    onClose();
  }, [onClose]);

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty);
  }, []);

  const applicationsCount = job._count?.applications ?? 0;

  // View Mode Content
  const viewContent = (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Status e Info principale */}
      <div className="flex items-center gap-3 flex-wrap">
        <Badge className={getJobStatusVariant(job.status)}>
          {getJobStatusLabel(job.status)}
        </Badge>
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm">
          <Users className="h-4 w-4" />
          <span>{applicationsCount} candidature</span>
        </div>
      </div>

      {/* Dettagli */}
      <div className="space-y-4">
        {job.location && (
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{job.location}</span>
          </div>
        )}

        {(job.salaryMin || job.salaryMax) && (
          <div className="flex items-center gap-2 text-sm">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <span>
              {job.salaryMin && job.salaryMax
                ? `€${job.salaryMin.toLocaleString()} - €${job.salaryMax.toLocaleString()}`
                : job.salaryMin
                  ? `Da €${job.salaryMin.toLocaleString()}`
                  : `Fino a €${job.salaryMax?.toLocaleString()}`}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Creato il {formatDate(job.createdAt)}</span>
        </div>
      </div>

      {/* Descrizione */}
      {job.description && (
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Descrizione</h4>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {job.description}
          </p>
        </div>
      )}
    </div>
  );

  // Edit Mode Content - Usa il form component
  const editContent = (
    <UpdateJobForm
      job={job}
      onSubmit={handleFormSubmit}
      onCancel={handleCancelEdit}
      isSubmitting={isUpdating}
      onDirtyChange={handleDirtyChange}
    />
  );

  // Footer per View Mode
  const viewFooter = showArchiveConfirm ? (
    <div className="w-full">
      <InlineConfirmationDanger
      isVisible={true}
      onCancel={handleCancelArchive}
      onConfirm={handleArchiveConfirm}
      title="Archivia annuncio"
      description="L'annuncio non sarà più visibile ai candidati ma le candidature esistenti verranno mantenute."
      confirmButtonText="Archivia"
      cancelButtonText="Annulla"
      isLoading={isArchiving}
      icon={Trash2}
      buttonVariant="destructive"
      />
    </div>
  ) : (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        {canArchive && (
          <Button variant="destructive" size="sm" onClick={handleArchiveClick}>
            <Trash2 className="h-4 w-4 mr-2" />
            Archivia
          </Button>
        )}
        {canEdit && (
          <Button variant="outline" size="sm" onClick={handleEditClick}>
            <Pencil className="h-4 w-4 mr-2" />
            Modifica
          </Button>
        )}
      </div>
      <Button variant="default" size="sm" asChild>
        <Link
          to={`/applications?jobId=${job.id}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Users className="h-4 w-4 mr-2" />
          Vai alle Candidature ({applicationsCount})
        </Link>
      </Button>
    </div>
  );

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      header={{
        title: mode === "view" ? job.title : "Modifica Annuncio",
        description:
          mode === "view"
            ? `Dettagli dell'annuncio di lavoro`
            : "Modifica i dettagli dell'annuncio",
      }}
      footer={mode === "view" ? viewFooter : undefined}
      smartAutoClose={mode === "edit"}
      isSafeToAutoClose={!isFormDirty}
    >
      {mode === "view" ? viewContent : editContent}
    </CustomDialog>
  );
}
