import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { PasswordInputField } from "@/features/shared/components/fields";
import {
  changePasswordSchema,
  type ChangePasswordFormValues,
} from "@/features/auth/schemas/change-password.schema";

interface ChangePasswordFormProps {
  onSubmit: (data: ChangePasswordFormValues) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  /** Callback when form dirty state changes (for smartAutoClose) */
  onDirtyChange?: (isDirty: boolean) => void;
}

/**
 * ChangePasswordForm Component
 * Uses PasswordInputField for consistent password inputs
 */
export const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
  onDirtyChange,
}) => {
  const form = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notify parent when dirty state changes
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  const handleFormSubmit = async (data: ChangePasswordFormValues) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-4 p-4"
      >
        <PasswordInputField
          control={form.control}
          name="currentPassword"
          label="Password Attuale"
          placeholder="Inserisci la password attuale"
          required
        />

        <PasswordInputField
          control={form.control}
          name="newPassword"
          label="Nuova Password"
          placeholder="Inserisci la nuova password"
          required
        />

        <PasswordInputField
          control={form.control}
          name="confirmPassword"
          label="Conferma Nuova Password"
          placeholder="Conferma la nuova password"
          required
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annulla
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Aggiornamento...
              </>
            ) : (
              "Aggiorna Password"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
