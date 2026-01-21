import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText?: string;
  onButtonClick?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  onButtonClick,
  icon,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4">{description}</p>
      {buttonText && onButtonClick && (
        <Button onClick={onButtonClick} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          {buttonText}
        </Button>
      )}
    </div>
  );
};
