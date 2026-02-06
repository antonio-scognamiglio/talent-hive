/**
 * InlineConfirmationSuccess Component
 *
 * Green-styled wrapper for InlineConfirmation for hire/accept actions
 */

import { InlineConfirmation } from "./InlineConfirmation";
import { CheckCircle2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { InlineConfirmationProps } from "./InlineConfirmation";

type InlineConfirmationSuccessProps = Omit<
  InlineConfirmationProps,
  | "iconColor"
  | "icon"
  | "titleColor"
  | "descriptionColor"
  | "buttonVariant"
  | "className"
  | "confirmButtonClassName"
> & {
  icon?: LucideIcon;
  showMessageField?: boolean;
  messagePlaceholder?: string;
};

export function InlineConfirmationSuccess({
  icon: Icon = CheckCircle2,
  showMessageField = false,
  messagePlaceholder = "Messaggio (opzionale)",
  ...props
}: InlineConfirmationSuccessProps) {
  return (
    <InlineConfirmation
      {...props}
      icon={Icon}
      iconColor="text-green-600 dark:text-green-400"
      titleColor="text-green-700 dark:text-green-400"
      descriptionColor="text-green-600 dark:text-green-400"
      buttonVariant="default"
      showMessageField={showMessageField}
      messagePlaceholder={messagePlaceholder}
      className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800"
      confirmButtonClassName="bg-green-600 hover:bg-green-700 text-white"
    />
  );
}
