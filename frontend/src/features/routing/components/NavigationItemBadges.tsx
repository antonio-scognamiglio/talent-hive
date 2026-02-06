import { TimerBadge } from "@/features/shared/components/TimerBadge";
import { NotificationBadge } from "@/features/shared/components/NotificationBadge";

interface NavigationItemBadgesProps {
  /** Numero di timer attivi */
  activeTimersCount: number;
  /** Se c'è un timer attivo */
  hasActiveTimer?: boolean;
  /** Numero di notifiche (opzionale) */
  badgeCount?: number;
}

/**
 * Badge per gli indicatori nella versione espansa della sidebar
 * Mostra badge verde pulsante per timer (con count se > 1) e badge rosso per notifiche
 */
export function NavigationItemBadges({
  activeTimersCount,
  hasActiveTimer,
  badgeCount,
}: NavigationItemBadgesProps) {
  return (
    <div className="flex items-center gap-2 ml-auto">
      {/* Badge verde pulsante per timer (mostrato se ci sono timer attivi) */}
      {(activeTimersCount > 0 || hasActiveTimer) && (
        <TimerBadge count={activeTimersCount} />
      )}
      {/* Badge per notifiche (mostrato solo se badgeCount è fornito) */}
      {badgeCount !== undefined && <NotificationBadge count={badgeCount} />}
    </div>
  );
}
