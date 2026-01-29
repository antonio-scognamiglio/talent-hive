import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authService } from "@/features/shared/services/auth.service";
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import type { MutationConfigMap } from "@/features/shared/types/mutation.types";
import type { RegisterDto, UpdateProfileDto } from "@shared/types";
import { queryKeys } from "@/features/shared/config/query-client.config";

interface UseAuthOperationsProps {
  config?: MutationConfigMap<
    "registerCandidate" | "changePassword" | "updateProfile"
  >;
}

export const useAuthOperations = ({
  config = {
    registerCandidate: {
      showErrorToast: true,
      showSuccessToast: false,
    },
    changePassword: {
      showErrorToast: false,
      showSuccessToast: true,
    },
    updateProfile: {
      showErrorToast: false,
      showSuccessToast: true,
    },
  },
}: UseAuthOperationsProps = {}) => {
  const queryClient = useQueryClient();

  const registerCandidateMut = useMutation({
    mutationFn: (data: RegisterDto) => authService.register(data),
    onSuccess: (data) => {
      if (config?.registerCandidate?.showSuccessToast) {
        handleSuccess(data, "Registrazione completata con successo");
      }
      if (config?.registerCandidate?.onSuccess) {
        config.registerCandidate.onSuccess(data);
      }
    },
    onError: (error) => {
      if (config?.registerCandidate?.showErrorToast) {
        handleError(error, "Registrazione fallita");
      }
      if (config?.registerCandidate?.onError) {
        config.registerCandidate.onError(error);
      }
    },
  });

  const changePasswordMut = useMutation({
    mutationFn: (data: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => authService.changePassword(data),
    onMutate: () => {
      if (config?.changePassword?.onMutate) {
        config.changePassword.onMutate();
      }
    },
    onSuccess: (data) => {
      if (config?.changePassword?.showSuccessToast) {
        handleSuccess(data, "Password aggiornata con successo");
      }
      if (config?.changePassword?.onSuccess) {
        config.changePassword.onSuccess(data);
      }
    },
    onError: (error) => {
      if (config?.changePassword?.showErrorToast) {
        handleError(error, "Errore durante il cambio password");
      }
      if (config?.changePassword?.onError) {
        config.changePassword.onError(error);
      }
    },
  });

  const updateProfileMut = useMutation({
    mutationFn: (data: UpdateProfileDto) => authService.updateProfile(data),
    onSuccess: (data) => {
      // Invalidate auth.me query to refresh user data in context/UI
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });

      if (config?.updateProfile?.showSuccessToast) {
        handleSuccess(data, "Profilo aggiornato con successo");
      }
      if (config?.updateProfile?.onSuccess) {
        config.updateProfile.onSuccess(data);
      }
    },
    onError: (error) => {
      if (config?.updateProfile?.showErrorToast) {
        handleError(error, "Errore durante l'aggiornamento del profilo");
      }
      if (config?.updateProfile?.onError) {
        config.updateProfile.onError(error);
      }
    },
  });

  return {
    registerCandidateMut,
    changePasswordMut,
    updateProfileMut,
  };
};
