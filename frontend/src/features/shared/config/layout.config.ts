import type { ReactNode } from "react";
import { USER_ROLES, type UserRole } from "@/features/shared/types/roles.types";

/**
 * Layout Configuration
 * Definisce come deve apparire il layout per ogni ruolo
 */
export interface LayoutConfig {
  /** Se mostrare la sidebar */
  showSidebar: boolean;

  /** Se mostrare la topbar */
  showTopbar: boolean;

  /** Titolo dell'applicazione mostrato nella topbar */
  title: string;

  /** Logo dell'applicazione (opzionale, ReactNode per permettere componenti custom) */
  logo?: ReactNode;

  /** Larghezza della sidebar (in rem) */
  sidebarWidth?: string;

  /** Se mostrare UserMenu nella sidebar */
  showUserMenuInSidebar?: boolean;

  /** Se mostrare UserMenu nella topbar */
  showUserMenuInTopbar?: boolean;
}

/**
 * Configurazione layout per ogni ruolo
 */
export const LAYOUT_CONFIG: Record<UserRole, LayoutConfig> = {
  [USER_ROLES.ADMIN]: {
    showSidebar: true,
    showTopbar: true,
    title: "TalentHive",
    sidebarWidth: "16", // 256px
    showUserMenuInSidebar: false,
    showUserMenuInTopbar: true,
  },

  [USER_ROLES.RECRUITER]: {
    showSidebar: true,
    showTopbar: true,
    title: "TalentHive",
    sidebarWidth: "16",
    showUserMenuInSidebar: false,
    showUserMenuInTopbar: true,
  },

  [USER_ROLES.CANDIDATE]: {
    showSidebar: true,
    showTopbar: true,
    title: "TalentHive",
    sidebarWidth: "16",
    showUserMenuInSidebar: false,
    showUserMenuInTopbar: true,
  },
};

/**
 * Ottiene la configurazione layout per un determinato ruolo
 *
 * @param role - Il ruolo dell'utente
 * @param isMobile - (Opzionale) Se true, override automatico per comportamento responsive
 * @returns La configurazione layout per il ruolo specificato
 */
export const getLayoutConfig = (
  role: UserRole,
  isMobile?: boolean
): LayoutConfig => {
  const baseConfig = LAYOUT_CONFIG[role];

  // Se isMobile non è fornito o è false, usa la config base
  if (!isMobile) {
    return baseConfig;
  }

  // Override responsive: UserMenu in topbar su mobile
  return {
    ...baseConfig,
    showUserMenuInSidebar: false,
    showUserMenuInTopbar: true,
  };
};
