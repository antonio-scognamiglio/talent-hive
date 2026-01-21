import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarToggleProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function SidebarToggle({ isCollapsed, onToggle }: SidebarToggleProps) {
  return (
    <button
      className={cn(
        "absolute -right-3 top-1/2 -translate-y-1/2 translate-x-1/2 z-10",
        "h-11 w-6 rounded-r-lg",
        "border border-border bg-card shadow-sm",
        "hover:bg-accent hover:text-accent-foreground hover:shadow-md",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "flex items-center justify-center cursor-pointer",
      )}
      onClick={onToggle}
      aria-label={isCollapsed ? "Espandi sidebar" : "Collassa sidebar"}
    >
      {isCollapsed ? (
        <ChevronRight className="h-5 w-5" />
      ) : (
        <ChevronLeft className="h-5 w-5" />
      )}
    </button>
  );
}
