import { useState, useCallback } from "react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { CreateJobForm } from "@/features/jobs/components/forms/CreateJobForm";
import type { CreateJobFormValues } from "@/features/jobs/schemas/create-job.schema";
import { toCreateJobDto } from "@/features/jobs/schemas/create-job.schema";
import type { CreateJobDto } from "@shared/types";

interface CreateJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateJobDto) => Promise<void>;
  isCreating?: boolean;
}

export function CreateJobDialog({
  isOpen,
  onClose,
  onCreate,
  isCreating = false,
}: CreateJobDialogProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);

  const handleSubmitDraft = useCallback(
    async (data: CreateJobFormValues) => {
      const dto = toCreateJobDto(data, "DRAFT");
      await onCreate(dto);
    },
    [onCreate],
  );

  const handleSubmitPublish = useCallback(
    async (data: CreateJobFormValues) => {
      const dto = toCreateJobDto(data, "PUBLISHED");
      await onCreate(dto);
    },
    [onCreate],
  );

  const handleClose = useCallback(() => {
    setIsFormDirty(false);
    onClose();
  }, [onClose]);

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      header={{
        title: "Nuovo Annuncio",
        description:
          "Compila i dettagli per creare un nuovo annuncio di lavoro",
      }}
      smartAutoClose
      isSafeToAutoClose={!isFormDirty}
    >
      <CreateJobForm
        onSubmitDraft={handleSubmitDraft}
        onSubmitPublish={handleSubmitPublish}
        onCancel={handleClose}
        isSubmitting={isCreating}
        onDirtyChange={setIsFormDirty}
      />
    </CustomDialog>
  );
}
