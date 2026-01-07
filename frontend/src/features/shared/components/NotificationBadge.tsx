import { Badge } from "@/components/ui/badge";

interface NotificationBadgeProps {
  /** Numero di notifiche */
  count: number;
  /** Classi CSS aggiuntive */
  className?: string;
}

/**
 * Badge rosso per mostrare il numero di notifiche
 * Usato nella sidebar e in altri punti dell'applicazione
 */
export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  if (count <= 0) return null;

  return (
    <Badge
      variant="destructive"
      className={`h-5 min-w-5 px-1.5 text-xs flex items-center justify-center shadow-md ${
        className || ""
      }`}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
