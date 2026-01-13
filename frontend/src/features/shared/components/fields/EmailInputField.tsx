import {
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export interface EmailInputFieldProps<TForm extends FieldValues> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * EmailInputField Component
 *
 * Email input field for React Hook Form.
 * Type is set to "email" for browser-level validation hints.
 * Should be used with Zod email validation for robust checking.
 *
 * @example
 * <EmailInputField
 *   control={control}
 *   name="email"
 *   label="Email Address"
 *   required
 * />
 */
export function EmailInputField<TForm extends FieldValues>({
  control,
  name,
  label = "Email",
  placeholder = "you@example.com",
  disabled,
  required,
}: EmailInputFieldProps<TForm>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label} {required && <span className="text-destructive">*</span>}
          </FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder={placeholder}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
