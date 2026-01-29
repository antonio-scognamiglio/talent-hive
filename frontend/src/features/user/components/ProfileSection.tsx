import { useState } from "react";
import { Edit } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { useAuthOperations } from "@/features/auth/hooks/useAuthOperations";
import { PrimaryButton } from "@/features/shared/components/PrimaryButton";
import { UpdateProfileDialog } from "./UpdateProfileDialog";
import type { UpdateProfileFormValues } from "@/features/user/schemas/update-profile.schema";

export const ProfileSection = () => {
  const { user } = useAuthContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { updateProfileMut } = useAuthOperations({
    config: {
      updateProfile: {
        showSuccessToast: true,
        showErrorToast: true,
        onSuccess: () => setIsDialogOpen(false),
      },
    },
  });

  if (!user) return null;

  const handleSubmit = async (data: UpdateProfileFormValues) => {
    await updateProfileMut.mutateAsync(data);
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
        <div className="flex flex-row items-center justify-between mb-6">
          <h2 className="text-lg font-medium">Profilo Utente</h2>
          <PrimaryButton
            onClick={() => setIsDialogOpen(true)}
            text="Modifica"
            icon={<Edit className="h-4 w-4 mr-2" />}
            size="sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">
              Nome
            </span>
            <p className="text-base font-medium">{user.firstName}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-muted-foreground block mb-1">
              Cognome
            </span>
            <p className="text-base font-medium">{user.lastName}</p>
          </div>

          <div className="md:col-span-2">
            <span className="text-sm font-medium text-muted-foreground block mb-1">
              Email
            </span>
            <p className="text-base font-medium">{user.email}</p>
          </div>
        </div>
      </div>

      <UpdateProfileDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        user={user}
        onSubmit={handleSubmit}
        isSubmitting={updateProfileMut.isPending}
      />
    </>
  );
};
