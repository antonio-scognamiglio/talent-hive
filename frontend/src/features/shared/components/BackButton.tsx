import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onBack: () => void;
  label?: string;
  className?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({
  onBack,
  label = "Torna indietro",
  className = "",
}) => {
  return (
    <Button
      variant="ghost"
      onClick={onBack}
      className={`flex items-center gap-2 px-1 ${className}`}
      aria-label={label}
    >
      <ArrowLeft className="h-4 w-4" />
      <span className="text-sm">{label}</span>
    </Button>
  );
};
