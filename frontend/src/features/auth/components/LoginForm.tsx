import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  EmailInputField,
  PasswordInputField,
} from "@/features/shared/components/fields";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useAuthContext } from "../hooks/useAuthContext";

/**
 * LoginForm Component
 *
 * Form for user authentication.
 * Uses React Hook Form + Zod validation.
 * Matches lex-nexus structure: flex column, scrollable content, sticky button.
 */
export function LoginForm() {
  const { login, isLoading } = useAuthContext();
  const navigate = useNavigate();

  const form = useForm<LoginFormData>({
    // @ts-expect-error - Zod v3 type compatibility issue with @hookform/resolvers
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      toast.success("Bentornato!");
      navigate("/jobs");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Accesso fallito";
      toast.error(message);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex h-full min-h-0 flex-col"
      >
        {/* Scrollable content area */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-4 space-y-4">
          <EmailInputField control={form.control} name="email" required />
          <PasswordInputField control={form.control} name="password" required />
        </div>

        {/* Sticky button area */}
        <div className="pt-3">
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
