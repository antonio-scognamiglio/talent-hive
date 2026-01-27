import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import type { UseMutationResult } from "@tanstack/react-query";
import type { Application } from "@shared/types";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { Form } from "@/components/ui/form";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { SecondaryButton } from "@/features/shared/components/SecondaryButton";
import { ApplyJobForm } from "../forms/ApplyJobForm";
import {
  applyJobSchema,
  type ApplyJobFormValues,
} from "../../schemas/application-schema";

interface ApplyJobDialogProps {
  isOpen: boolean;
  onClose: () => void;
  jobId: string;
  jobTitle: string;
  applyJobMutation: UseMutationResult<
    Application,
    Error,
    { jobId: string; coverLetter?: string; cvFile: File }
  >;
}

/**
 * ApplyJobDialog Component
 *
 * Dialog per candidarsi a un job con CV upload e cover letter
 * Usa CustomDialog con smart autoclose per prevenire perdita dati
 *
 * @example
 * {dialog.isDialogOpen("apply") && dialog.selectedItem && (
 *   <ApplyJobDialog
 *     isOpen={true}
 *     onClose={dialog.closeDialog}
 *     jobId={dialog.selectedItem.id}
 *     jobTitle={dialog.selectedItem.title}
 *   />
 * )}
 */
export function ApplyJobDialog({
  isOpen,
  onClose,
  jobId,
  jobTitle,
  applyJobMutation,
}: ApplyJobDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const form = useForm<ApplyJobFormValues>({
    resolver: zodResolver(applyJobSchema),
    defaultValues: {
      jobId,
      coverLetter: undefined,
    },
  });

  const handleSubmit = async (data: ApplyJobFormValues) => {
    if (!selectedFile) {
      toast.error("Seleziona un file CV");
      return;
    }

    try {
      await applyJobMutation.mutateAsync({
        jobId: data.jobId,
        coverLetter: data.coverLetter,
        cvFile: selectedFile,
      });
      onClose();
    } catch (error) {
      // Error già gestito dal mutation hook
      console.error("Apply error:", error);
    }
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      smartAutoClose={true}
      isSafeToAutoClose={!form.formState.isDirty && !selectedFile}
      header={{
        title: "Candidati per questa posizione",
        description: jobTitle,
      }}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="flex flex-col h-full"
        >
          {/* Content scrollabile */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4">
            <ApplyJobForm
              control={form.control}
              isSubmitting={applyJobMutation.isPending}
              selectedFile={selectedFile}
              onFileSelect={setSelectedFile}
            />
          </div>

          {/* Footer fisso DENTRO form */}
          <div className="shrink-0 border-t p-4 flex justify-end gap-2">
            <SecondaryButton type="button" onClick={onClose} text="Annulla" />
            <PrimaryButton
              type="submit"
              disabled={applyJobMutation.isPending || !selectedFile}
              text={
                applyJobMutation.isPending ? "Invio..." : "Invia Candidatura"
              }
            />
          </div>
        </form>
      </Form>
    </CustomDialog>
  );
}
