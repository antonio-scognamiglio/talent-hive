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

export interface TextInputFieldProps<TForm extends FieldValues> {
  control: Control<TForm>;
  name: FieldPath<TForm>;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * TextInputField Component
 *
 * Generic text input field for React Hook Form.
 * Wraps Shadcn Form components for consistent styling and validation display.
 *
 * @example
 * <TextInputField
 *   control={control}
 *   name="firstName"
 *   label="First Name"
 *   required
 * />
 */
export function TextInputField<TForm extends FieldValues>({
  control,
  name,
  label,
  placeholder,
  disabled,
  readOnly,
  required,
  className,
}: TextInputFieldProps<TForm>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel>
              {label} {required && <span className="text-destructive">*</span>}
            </FormLabel>
          )}
          <FormControl>
            <Input
              type="text"
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
