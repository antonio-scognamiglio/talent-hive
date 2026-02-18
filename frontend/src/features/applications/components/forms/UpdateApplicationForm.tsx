import { useEffect, useCallback } from "react";
import { useForm, useWatch } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { SecondaryButton } from "@/features/shared/components/SecondaryButton";
import {
  updateApplicationSchema,
  type UpdateApplicationFormValues,
} from "@/features/applications/schemas/update-application.schema";
import type { Application } from "@shared/types";
import {
  SCORE_OPTIONS,
  ALL_WORKFLOW_STATUSES,
} from "@/features/applications/constants/applications-options";
import { getApplicationStatusLabel } from "@/features/applications/utils/status.utils";

interface UpdateApplicationFormProps {
  application: Application;
  onSubmit: (data: UpdateApplicationFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
  onValuesChange?: (values: Partial<UpdateApplicationFormValues>) => void;

  id?: string;
  hideFooter?: boolean;
}

const WORKFLOW_STATUS_OPTIONS = ALL_WORKFLOW_STATUSES.filter(
  (s) => s !== "DONE",
).map((status) => ({
  label: getApplicationStatusLabel(status),
  value: status,
}));

/**
 * Form per aggiornamento Application.
 * Usato nel ApplicationDetailDialog quando in modalità edit.
 */
export const UpdateApplicationForm: React.FC<UpdateApplicationFormProps> = ({
  application,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDirtyChange,
  onValuesChange,
  id,
  hideFooter = false,
}) => {
  const form = useForm<UpdateApplicationFormValues>({
    resolver: zodResolver(updateApplicationSchema),
    defaultValues: {
      workflowStatus: application.workflowStatus,
      notes: application.notes ?? "",
      score: application.score ?? undefined,
    },
  });

  // Notify parent when dirty state changes (per smartAutoClose)
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  // useWatch hook per tracciare i valori in modo sicuro per React Compiler
  const currentValues = useWatch({ control: form.control });

  // Notify parent when values change (per Smart Actions)
  useEffect(() => {
    onValuesChange?.(currentValues);
  }, [currentValues, onValuesChange]);

  const handleSubmit = useCallback(
    async (data: UpdateApplicationFormValues) => {
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
        id={id}
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col h-full"
      >
        {/* Content scrollabile */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4">
          {/* Workflow Status */}
          <FormField
            control={form.control}
            name="workflowStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Workflow Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {WORKFLOW_STATUS_OPTIONS.map((option) => (
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

          {/* Score */}
          <FormField
            control={form.control}
            name="score"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valutazione</FormLabel>
                <Select
                  onValueChange={(value) =>
                    field.onChange(
                      value === "none" ? undefined : parseInt(value),
                    )
                  }
                  value={field.value?.toString() || "none"}
                >
                  <FormControl>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Seleziona valutazione" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SCORE_OPTIONS.map((option) => (
                      <SelectItem
                        key={option.value ?? "none"}
                        value={option.value?.toString() || "none"}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Aggiungi note sulla candidatura..."
                    className="min-h-32 resize-none"
                    rows={8}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Footer DENTRO form per Enter key submit */}
        {!hideFooter && (
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
        )}
      </form>
    </Form>
  );
};
