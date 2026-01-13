import { useMutation } from "@tanstack/react-query";
import { authService } from "@/features/shared/services/auth.service";
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import type { MutationConfigMap } from "@/features/shared/types/mutation.types";
import type { RegisterDto } from "@shared/types";

interface UseAuthOperationsProps {
  config?: MutationConfigMap<"registerCandidate">;
}

export const useAuthOperations = ({
  config = {
    registerCandidate: {
      showErrorToast: true,
      showSuccessToast: false, // UI handles success message/flow usually, but configurable
    },
  },
}: UseAuthOperationsProps = {}) => {
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

  return {
    registerCandidateMut,
  };
};
