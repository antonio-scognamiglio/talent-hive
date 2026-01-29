import { useState, useCallback } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { ChangePasswordForm } from "@/features/auth/components/forms/ChangePasswordForm";
import { useAuthOperations } from "@/features/auth/hooks/useAuthOperations";
import { getErrorMessage } from "@/features/shared/utils/error.utils";
import type { ChangePasswordFormValues } from "@/features/auth/schemas/change-password.schema";

interface ChangePasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * ChangePasswordDialog Component
 *
 * Uses CustomDialog with smartAutoClose.
 * Form component communicates isDirty via onDirtyChange callback.
 */
export function ChangePasswordDialog({
  isOpen,
  onClose,
}: ChangePasswordDialogProps) {
  const [error, setError] = useState<string | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const { changePasswordMut } = useAuthOperations({
    config: {
      changePassword: {
        showSuccessToast: true,
        onMutate: () => {
          setError(null);
        },
        onSuccess: () => {
          onClose();
        },
        onError: (err) => {
          setError(getErrorMessage(err, "Errore durante il cambio password"));
        },
      },
    },
  });

  const handleSubmit = useCallback(
    async (data: ChangePasswordFormValues) => {
      await changePasswordMut.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });
    },
    [changePasswordMut],
  );

  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty);
  }, []);

  const isSubmitting = changePasswordMut.isPending;

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      smartAutoClose={true}
      isSafeToAutoClose={!isFormDirty}
      header={{
        title: "Cambio Password",
        description:
          "Modifica la password del tuo account. Assicurati di utilizzare una password sicura.",
      }}
    >
      <div className="flex flex-col h-full">
        {error && (
          <Alert variant="destructive" className="m-4 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <ChangePasswordForm
          onSubmit={handleSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
          onDirtyChange={handleDirtyChange}
        />
      </div>
    </CustomDialog>
  );
}
