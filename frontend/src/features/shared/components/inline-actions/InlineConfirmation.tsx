/**
 * InlineConfirmation Component
 *
 * Base component for inline confirmations (hire/reject actions)
 * Subtle variant without invasive borders
 */

import React, { type ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export interface InlineConfirmationProps {
  isVisible: boolean;
  onCancel: () => void;
  onConfirm: (message?: string) => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading: boolean;
  icon: LucideIcon;
  iconColor?: string;
  titleColor?: string;
  descriptionColor?: string;
  showMessageField?: boolean; // For reject with optional reason
  messagePlaceholder?: string;
  className?: string;
  buttonVariant?:
    | "default"
    | "outline"
    | "destructive"
    | "secondary"
    | "ghost"
    | "link";
  confirmButtonClassName?: string;
}

export const InlineConfirmation: React.FC<InlineConfirmationProps> = ({
  isVisible,
  onCancel,
  onConfirm,
  title,
  description,
  confirmButtonText = "Conferma",
  cancelButtonText = "Annulla",
  isLoading = false,
  icon: Icon,
  iconColor = "text-muted-foreground",
  titleColor = "text-foreground",
  descriptionColor = "text-muted-foreground",
  showMessageField = false,
  messagePlaceholder = "Messaggio (opzionale)",
  className,
  buttonVariant = "default",
  confirmButtonClassName,
}) => {
  const [message, setMessage] = useState("");

  if (!isVisible) return null;

  const handleConfirm = () => {
    if (showMessageField) {
      onConfirm(message || undefined);
    } else {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setMessage("");
    onCancel();
  };

  return (
    <div
      className={cn(
        "p-3 rounded-md bg-muted/50 border border-border",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", iconColor)} />
        <div className="flex-1 space-y-3">
          <div>
            <p className={cn("text-sm font-medium mb-1", titleColor)}>
              {title}
            </p>
            {description && (
              <div className={cn("text-xs", descriptionColor)}>
                {description}
              </div>
            )}
          </div>

          {showMessageField && (
            <Textarea
              placeholder={messagePlaceholder}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-20 text-sm"
              disabled={isLoading}
            />
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isLoading}
            >
              {cancelButtonText}
            </Button>
            <Button
              variant={buttonVariant}
              size="sm"
              onClick={handleConfirm}
              disabled={isLoading}
              className={confirmButtonClassName}
            >
              {isLoading ? "Caricamento..." : confirmButtonText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
