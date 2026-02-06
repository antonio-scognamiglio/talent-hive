/**
 * InlineConfirmationDanger Component
 *
 * Red-styled wrapper for InlineConfirmation for reject/delete actions
 */

import { InlineConfirmation } from "./InlineConfirmation";
import { XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InlineConfirmationProps } from "./InlineConfirmation";

type InlineConfirmationDangerProps = Omit<
  InlineConfirmationProps,
  | "iconColor"
  | "titleColor"
  | "descriptionColor"
  | "className"
  | "confirmButtonClassName"
  | "icon"
> & {
  icon?: LucideIcon;
  buttonVariant?: "default" | "destructive";
  showMessageField?: boolean;
  messagePlaceholder?: string;
  confirmButtonClassName?: string;
};

export function InlineConfirmationDanger({
  icon: Icon = XCircle,
  buttonVariant = "default",
  showMessageField = false,
  messagePlaceholder = "Messaggio (opzionale)",
  confirmButtonClassName,
  ...props
}: InlineConfirmationDangerProps) {
  const defaultConfirmButtonClassName =
    buttonVariant === "destructive"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : "bg-red-600 hover:bg-red-700 text-white";

  return (
    <InlineConfirmation
      {...props}
      icon={Icon}
      iconColor="text-destructive dark:text-red-400"
      titleColor="text-destructive dark:text-red-400"
      descriptionColor="text-destructive/80 dark:text-red-400/80"
      buttonVariant={buttonVariant}
      showMessageField={showMessageField}
      messagePlaceholder={messagePlaceholder}
      className="bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      confirmButtonClassName={
        confirmButtonClassName || defaultConfirmButtonClassName
      }
    />
  );
}
