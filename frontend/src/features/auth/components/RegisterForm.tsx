import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EmailInputField,
  PasswordInputField,
  TextInputField,
} from "@/features/shared/components/fields";
import { z } from "zod";

// Register schema WITHOUT role (only CANDIDATE can register)
const registerSchema = z
  .object({
    email: z.string().min(1, "Email è richiesta").email("Email non valida"),
    password: z.string().min(8, "Password deve essere almeno 8 caratteri"),
    confirmPassword: z.string().min(1, "Conferma password"),
    firstName: z.string().min(2, "Nome deve essere almeno 2 caratteri"),
    lastName: z.string().min(2, "Cognome deve essere almeno 2 caratteri"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

/**
 * RegisterForm Component
 *
 * Form for candidate registration (ONLY).
 * RECRUITER and ADMIN accounts are provisioned by admins.
 * Matches lex-nexus structure: flex column, scrollable content, sticky button.
 */
export function RegisterForm() {
  const navigate = useNavigate();

  const form = useForm<RegisterFormData>({
    // @ts-expect-error - Zod v3 type compatibility issue with @hookform/resolvers
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      firstName: "",
      lastName: "",
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // TODO: Wire to authService.register() - defaults to CANDIDATE role
      console.log("Register data:", { ...data, role: "CANDIDATE" });
      toast.success("Registrazione completata! Effettua l'accesso.");
      navigate("/jobs");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Registrazione fallita";
      toast.error(message);
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
