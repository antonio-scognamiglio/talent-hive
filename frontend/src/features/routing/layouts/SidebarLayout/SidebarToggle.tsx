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
        "absolute -right-3 z-10",
        "w-6 rounded-r-lg! rounded-t-lg! rounded-b-lg! rounded-tl-none! rounded-bl-none!",
        "border border-border bg-card! opacity-100! shadow-sm",
        "hover:bg-accent! hover:text-accent-foreground hover:shadow-md",
        "transition-all duration-200",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        "flex items-center justify-center",
        "inline-flex cursor-pointer",
        "h-11 top-[calc(50%+2px)] -translate-y-1/2 translate-x-1/2"
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
