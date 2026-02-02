import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { SecondaryButton } from "@/features/shared/components/SecondaryButton";
import {
  NumberInputField,
  TextInputField,
  TextareaField,
} from "@/features/shared/components/fields";
import {
  updateJobSchema,
  type UpdateJobFormValues,
} from "@/features/jobs/schemas/update-job.schema";
import type { JobWithCount } from "@/features/jobs/types/job.types";

interface UpdateJobFormProps {
  job: JobWithCount;
  onSubmit: (data: UpdateJobFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

const JOB_STATUS_OPTIONS = [
  { value: "DRAFT", label: "Bozza" },
  { value: "PUBLISHED", label: "Pubblicato" },
  { value: "ARCHIVED", label: "Archiviato" },
] as const;

/**
 * Form per aggiornamento Job.
 * Usato nel JobDetailDialog quando in modalità edit.
 */
export const UpdateJobForm: React.FC<UpdateJobFormProps> = ({
  job,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDirtyChange,
}) => {
  const form = useForm<UpdateJobFormValues>({
    resolver: zodResolver(updateJobSchema),
    defaultValues: {
      title: job.title,
      description: job.description ?? "",
      location: job.location ?? "",
      salaryMin: (job.salaryMin ?? "") as number | "",
      salaryMax: (job.salaryMax ?? "") as number | "",
      status: job.status,
    },
  });

  // Notify parent when dirty state changes (per smartAutoClose)
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const handleSubmit = useCallback(
    async (data: UpdateJobFormValues) => {
      await onSubmit(data);
      // Reset form con nuovi valori per pulire dirty state
      form.reset(data);
    },
    [onSubmit, form],
  );

  const handleCancel = useCallback(() => {
    form.reset();
    onCancel();
  }, [form, onCancel]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        {/* Content scrollabile */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stato</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {JOB_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Titolo */}
          <TextInputField
            control={form.control}
            name="title"
            label="Titolo"
            placeholder="Titolo dell'annuncio"
          />

          {/* Location */}
          <TextInputField
            control={form.control}
            name="location"
            label="Località"
            placeholder="Es: Milano, Remote, Hybrid"
          />

          {/* Salary Grid */}
          <div className="grid grid-cols-2 gap-4">
            <NumberInputField<UpdateJobFormValues>
              control={form.control}
              name="salaryMin"
              label="Salario minimo"
              placeholder="30000"
              prefix="€"
              step={1000}
            />
            <NumberInputField<UpdateJobFormValues>
              control={form.control}
              name="salaryMax"
              label="Salario massimo"
              placeholder="50000"
              prefix="€"
              step={1000}
            />
          </div>

          {/* Description */}
          <TextareaField
            control={form.control}
            name="description"
            label="Descrizione"
            placeholder="Descrizione del ruolo..."
            rows={8}
          />
        </div>

        {/* Footer DENTRO form per Enter key submit */}
        <div className="shrink-0 border-t p-4 flex justify-end gap-3">
          <SecondaryButton
            type="button"
            text="Annulla"
            onClick={handleCancel}
            disabled={isSubmitting}
          />
          <PrimaryButton
            type="submit"
            text={isSubmitting ? "Salvataggio..." : "Salva"}
            disabled={isSubmitting || !form.formState.isDirty}
          />
        </div>
      </form>
    </Form>
  );
};
