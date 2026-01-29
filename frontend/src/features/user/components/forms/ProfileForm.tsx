import { useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { SecondaryButton } from "@/features/shared/components/SecondaryButton";
import {
  TextInputField,
  PasswordInputField,
} from "@/features/shared/components/fields";
import {
  updateProfileSchema,
  type UpdateProfileFormValues,
} from "@/features/user/schemas/update-profile.schema";

interface ProfileFormProps {
  defaultValues: {
    firstName: string;
    lastName: string;
    email: string;
  };
  onSubmit: (data: UpdateProfileFormValues) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * ProfileForm Component
 * Form to update user profile (firstName, lastName, email)
 * Requires password confirmation for security
 */
export const ProfileForm: React.FC<ProfileFormProps> = ({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDirtyChange,
}) => {
  const form = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      ...defaultValues,
      currentPassword: "",
    },
  });

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const handleSubmit = useCallback(
    async (data: UpdateProfileFormValues) => {
      await onSubmit(data);
      // Reset form with new values (without password) to clear dirty state
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        currentPassword: "",
      });
    },
    [onSubmit, form],
  );

  const handleCancel = useCallback(() => {
    form.reset({
      ...defaultValues,
      currentPassword: "",
    });
    onCancel?.();
  }, [form, defaultValues, onCancel]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-4 p-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TextInputField
            control={form.control}
            name="firstName"
            label="Nome"
            placeholder="Il tuo nome"
          />

          <TextInputField
            control={form.control}
            name="lastName"
            label="Cognome"
            placeholder="Il tuo cognome"
          />
        </div>

        <TextInputField
          control={form.control}
          name="email"
          label="Email"
          placeholder="La tua email"
        />

        <div className="pt-4 border-t">
          <PasswordInputField
            control={form.control}
            name="currentPassword"
            label="Password attuale"
            placeholder="Inserisci la tua password per confermare"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Richiesta per confermare le modifiche al profilo
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
          {onCancel && (
            <SecondaryButton
              type="button"
              text="Annulla"
              onClick={handleCancel}
              disabled={isSubmitting}
            />
          )}
          <PrimaryButton
            type="submit"
            text={isSubmitting ? "Salvataggio..." : "Salva modifiche"}
            disabled={isSubmitting || !form.formState.isDirty}
          />
        </div>
      </form>
    </Form>
  );
};
