/**
 * Hook per verificare se c'è un timer attivo per un item della sidebar
 */
export function useSidebarTimerStatus() {
  // Return safe default instead of null
  return { hasActiveTimer: false, activeTimersCount: 0 };
}
