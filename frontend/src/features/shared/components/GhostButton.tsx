/**
 * GhostButton Component
 *
 * Pulsante "fantasma" per azioni terziarie, link discreti o azioni dentro card/liste.
 * Mantiene lo stesso stile di Button variant="ghost" ma incapsulato nel pattern shared.
 */

import { Button } from "@/components/ui/button";
import { type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface GhostButtonProps extends Pick<
  ButtonProps,
  "className" | "onClick" | "type" | "disabled" | "size"
> {
  text: string;
  icon?: React.ReactNode;
  showIcon?: boolean;
}

export const GhostButton: React.FC<GhostButtonProps> = ({
  text,
  icon,
  showIcon = true,
  className,
  onClick,
  type = "button",
  disabled,
  size = "sm",
  ...props
}) => {
  return (
    <Button
      type={type}
      variant="ghost"
      size={size}
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
