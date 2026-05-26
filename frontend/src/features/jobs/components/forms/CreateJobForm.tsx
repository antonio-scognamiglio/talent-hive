import { useEffect, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { Form } from "@/components/ui/form";
import { SecondaryButton } from "@/features/shared/components/SecondaryButton";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { InlineConfirmationSuccess } from "@/features/shared/components/inline-actions";
import {
  NumberInputField,
  TextInputField,
  TextareaField,
} from "@/features/shared/components/fields";
import {
  createJobSchema,
  type CreateJobFormValues,
} from "@/features/jobs/schemas/create-job.schema";

interface CreateJobFormProps {
  onSubmitDraft: (data: CreateJobFormValues) => Promise<void>;
  onSubmitPublish: (data: CreateJobFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * Form per creazione Job.
 * Usato nel CreateJobDialog.
 *
 * Footer interno al form (pattern CustomDialog rule #3).
 * Invio da tastiera disabilitato: l'utente deve scegliere esplicitamente tra
 * "Crea Bozza" e "Crea e Pubblica". Entrambi validano via form.handleSubmit().
 */
export const CreateJobForm: React.FC<CreateJobFormProps> = ({
  onSubmitDraft,
  onSubmitPublish,
  onCancel,
  isSubmitting = false,
  onDirtyChange,
}) => {
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [pendingValues, setPendingValues] =
    useState<CreateJobFormValues | null>(null);

  const form = useForm<CreateJobFormValues>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      title: "",
      description: "",
      location: "",
      salaryMin: "" as number | "",
      salaryMax: "" as number | "",
    },
  });

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const handleDraftClick = useCallback(
    () =>
      form.handleSubmit(async (data) => {
        await onSubmitDraft(data);
        form.reset();
      })(),
    [form, onSubmitDraft],
  );

  const handlePublishClick = useCallback(
    () =>
      form.handleSubmit((data) => {
        setPendingValues(data);
        setShowPublishConfirm(true);
      })(),
    [form],
  );

  const handlePublishConfirm = useCallback(async () => {
    if (!pendingValues) return;
    await onSubmitPublish(pendingValues);
    setPendingValues(null);
    setShowPublishConfirm(false);
    form.reset();
  }, [onSubmitPublish, pendingValues, form]);

  const handleCancelPublish = useCallback(() => {
    setPendingValues(null);
    setShowPublishConfirm(false);
  }, []);

  const handleCancel = useCallback(() => {
    form.reset();
    onCancel();
  }, [form, onCancel]);

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col h-full"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          <TextInputField
            control={form.control}
            name="title"
            label="Titolo"
            placeholder="Titolo dell'annuncio"
          />

          <TextInputField
            control={form.control}
            name="location"
            label="Località"
            placeholder="Es: Milano, Remote, Hybrid"
          />

          <div className="grid grid-cols-2 gap-4">
            <NumberInputField<CreateJobFormValues>
              control={form.control}
              name="salaryMin"
              label="Salario minimo"
              placeholder="30000"
              prefix="€"
              step={1000}
            />
            <NumberInputField<CreateJobFormValues>
              control={form.control}
              name="salaryMax"
              label="Salario massimo"
              placeholder="50000"
              prefix="€"
              step={1000}
            />
          </div>

          <TextareaField
            control={form.control}
            name="description"
            label="Descrizione"
            placeholder="Descrizione del ruolo..."
            rows={8}
          />
        </div>

        <div className="shrink-0 border-t p-4">
          {showPublishConfirm ? (
            <InlineConfirmationSuccess
              isVisible={true}
              onCancel={handleCancelPublish}
              onConfirm={handlePublishConfirm}
              title="Pubblica Annuncio"
              description="L'annuncio sarà immediatamente visibile ai candidati, che potranno candidarsi."
              confirmButtonText="Conferma e Pubblica"
              cancelButtonText="Annulla"
              isLoading={isSubmitting}
              icon={Send}
            />
          ) : (
            <div className="flex items-center justify-between">
              <SecondaryButton
                text="Annulla"
                onClick={handleCancel}
                disabled={isSubmitting}
              />
              <div className="flex items-center gap-2">
                <SecondaryButton
                  text={isSubmitting ? "Creazione..." : "Crea Bozza"}
                  onClick={handleDraftClick}
                  disabled={isSubmitting}
                />
                <PrimaryButton
                  text="Crea e Pubblica"
                  onClick={handlePublishClick}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
};
