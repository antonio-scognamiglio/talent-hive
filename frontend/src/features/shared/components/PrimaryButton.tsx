/**
 * PrimaryButton Component
 *
 * Pulsante primario riutilizzabile per azioni principali (submit, creazione, etc.)
 */

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface PrimaryButtonProps
  extends Pick<
    ButtonProps,
    "className" | "onClick" | "type" | "disabled" | "variant" | "size"
  > {
  text: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  text,
  icon,
  showIcon,
  className,
  onClick,
  type = "button",
  disabled,
  variant,
  size = "sm",
  ...props
}) => {
  return (
    <Button
      type={type}
      size={size}
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn("flex items-center gap-2 cursor-pointer py-1.5", className)}
      {...props}
    >
      {showIcon && (icon ?? <Plus className="h-4 w-4" />)}
      <span>{text}</span>
    </Button>
  );
};
