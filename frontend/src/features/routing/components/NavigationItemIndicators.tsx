interface NavigationItemIndicatorsProps {
  /** Numero di timer attivi */
  activeTimersCount: number;
  /** Numero di notifiche (opzionale) */
  badgeCount?: number;
}

/**
 * Indicatori (puntini) per la versione collassata della sidebar
 * Mostra puntino verde pulsante per timer e puntino rosso per notifiche
 */
export function NavigationItemIndicators({
  activeTimersCount,
  badgeCount,
}: NavigationItemIndicatorsProps) {
  const timerTitle =
    activeTimersCount > 1
      ? `${activeTimersCount} timer attivi`
      : "Timer attivo";

  return (
    <>
      {/* Puntino verde pulsante per timer (mostrato se ci sono timer attivi) */}
      {activeTimersCount > 0 && (
        <span
          className="absolute top-1 right-1 h-2 w-2 rounded-full bg-green-500 animate-pulse"
          title={timerTitle}
        />
      )}
      {/* Puntino rosso per notifiche (solo se badgeCount fornito) */}
      {badgeCount !== undefined && badgeCount > 0 && (
        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
      )}
    </>
  );
}
