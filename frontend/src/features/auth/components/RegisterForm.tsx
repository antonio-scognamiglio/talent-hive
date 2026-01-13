import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EmailInputField,
  PasswordInputField,
  TextInputField,
} from "@/features/shared/components/fields";
import {
  registerSchema,
  type RegisterFormData,
} from "../schemas/register.schema";
import { useAuthOperations } from "../hooks/useAuthOperations";

interface RegisterFormProps {
  onSuccess?: () => void;
}

/**
 * RegisterForm Component
 *
 * Form for candidate registration (ONLY).
 * RECRUITER and ADMIN accounts are provisioned by admins.
 * Matches lex-nexus structure: flex column, scrollable content, sticky button.
 */
export function RegisterForm({ onSuccess }: RegisterFormProps) {
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const { registerCandidateMut } = useAuthOperations({
    config: {
      registerCandidate: {
        onSuccess: () => {
          toast.success("Registrazione completata! Effettua l'accesso.");
          form.reset();
          onSuccess?.();
        },
      },
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    // Add role: CANDIDATE to the data payload
    const payload = { ...data, role: "CANDIDATE" as const };

    // Using mutateAsync to handle success/error in the UI component logic if needed
    // or rely on the hook. Since we want to reset form, let's use mutateAsync.
    try {
      await registerCandidateMut.mutateAsync(payload);
      form.reset();
    } catch (error) {
      // Toast handled by hook default error handler
      console.error("Registration error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full min-h-0 flex-col gap-4"
      >
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <TextInputField
              control={form.control}
              name="firstName"
              label="Nome"
              placeholder="Mario"
              required
            />
            <TextInputField
              control={form.control}
              name="lastName"
              label="Cognome"
              placeholder="Rossi"
              required
            />
          </div>

          <EmailInputField control={form.control} name="email" required />

          <PasswordInputField control={form.control} name="password" required />

          <PasswordInputField
            control={form.control}
            name="confirmPassword"
            label="Conferma Password"
            required
          />
        </div>

        {/* Sticky button area */}
        <div className="pt-3">
          <Button type="submit" className="w-full">
            Registrati
          </Button>
        </div>
      </form>
    </Form>
  );
}
