import { useCallback, useState } from "react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { ProfileForm } from "./forms/ProfileForm";
import type { UpdateProfileFormValues } from "@/features/user/schemas/update-profile.schema";
import type { UserWithoutPassword } from "@shared/types";

interface UpdateProfileDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserWithoutPassword;
  onSubmit: (data: UpdateProfileFormValues) => Promise<void>;
  isSubmitting: boolean;
}

export function UpdateProfileDialog({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}: UpdateProfileDialogProps) {
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Sync dirty state for smartAutoClose
  const handleDirtyChange = useCallback((isDirty: boolean) => {
    setIsFormDirty(isDirty);
  }, []);

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: "Modifica Profilo",
        description: "Aggiorna le tue informazioni personali.",
      }}
      smartAutoClose={true}
      isSafeToAutoClose={!isFormDirty}
    >
      <ProfileForm
        defaultValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        }}
        onSubmit={onSubmit}
        onCancel={onClose}
        isSubmitting={isSubmitting}
        onDirtyChange={handleDirtyChange}
      />
    </CustomDialog>
  );
}
