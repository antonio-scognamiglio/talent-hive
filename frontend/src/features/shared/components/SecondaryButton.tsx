/**
 * SecondaryButton Component
 *
 * Pulsante secondario riutilizzabile per azioni secondarie (annulla, chiudi, etc.)
 */

import { Button } from "@/components/ui/button";
import { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SecondaryButtonProps
  extends Pick<ButtonProps, "className" | "onClick" | "type" | "disabled"> {
  text: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  text,
  icon,
  showIcon,
  onClick,
  className,
  type = "button",
  disabled,
  ...props
}) => {
  return (
    <Button
      type={type}
      variant="outline"
      onClick={onClick}
      disabled={disabled}
      className={cn("cursor-pointer flex items-center gap-2", className)}
      {...props}
    >
      {showIcon && icon}
      <span>{text}</span>
    </Button>
  );
};
