import { Badge } from "@/components/ui/badge";

interface TimerBadgeProps {
  /** Numero di timer attivi */
  count?: number;
  /** Titolo del tooltip */
  title?: string;
}

/**
 * Badge verde pulsante per indicare timer attivi
 * Usato nella sidebar per mostrare quando ci sono timer attivi
 * Mostra il count se > 1
 */
export function TimerBadge({ count = 1, title }: TimerBadgeProps) {
  const displayTitle =
    title || (count > 1 ? `${count} timer attivi` : "Timer attivo");

  return (
    <Badge
      className="h-5 min-w-5 px-1.5 bg-green-500 hover:bg-green-500 animate-pulse flex items-center justify-center border-0 text-white text-xs font-semibold"
      title={displayTitle}
    >
      {count > 1 ? count : ""}
    </Badge>
  );
}
