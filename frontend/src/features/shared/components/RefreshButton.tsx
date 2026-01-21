/**
 * RefreshButton Component
 *
 * Pulsante per ricaricare i dati con animazione di loading.
 */

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface RefreshButtonProps {
  refetch: () => void;
  isLoading?: boolean;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  refetch,
  isLoading,
}) => {
  return (
    <Button
      variant="outline"
      size={"sm"}
      onClick={refetch}
      disabled={isLoading}
      className="flex items-center gap-2 cursor-pointer py-1.5"
    >
      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
      <span>Aggiorna</span>
    </Button>
  );
};
