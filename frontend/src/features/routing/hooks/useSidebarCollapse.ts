import { useState, useEffect, useCallback } from "react";

const SIDEBAR_COLLAPSED_KEY = "sidebar:collapsed";

/**
 * Hook per gestire lo stato di collasso della sidebar
 *
 * Features:
 * - Persistenza in localStorage
 * - Stato iniziale da localStorage o default (false = espansa)
 * - Toggle function
 *
 * @returns {object} { isCollapsed, toggleCollapse, setCollapsed }
 */
export function useSidebarCollapse() {
  // Leggi stato iniziale da localStorage
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
    return stored === "true";
  });

  // Salva in localStorage quando cambia
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Toggle function
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Set function (per controllo esterno se necessario)
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  return {
    isCollapsed,
    toggleCollapse,
    setCollapsed,
  };
}
