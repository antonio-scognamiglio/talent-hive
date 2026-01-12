import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@shared/types/index";

/**
 * Layout Type
 * Tipi di layout disponibili per le rotte
 */
export type LayoutType = "sidebar" | "navbar" | "guest" | null;

/**
 * Route Configuration
 * Unica interfaccia per tutte le rotte.
 */
export interface RouteConfig<TRole extends string = string> {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  layout?: LayoutType;
  requiredPermissions?: string[];

  /**
   * Ruoli permessi per accedere alla rotta.
   * - `null`: Rotta Pubblica
   * - `TRole[]`: Rotta Protetta
   */
  allowedRoles: TRole[] | null;

  meta?: {
    title: string;
    icon?: LucideIcon;
    showInSidebar?: boolean;
    sidebarOrder?: number;
    description?: string;
    hidden?: boolean;
    badgeCount?: () => number;
    hasActiveTimer?: () => boolean;
  };
}

/**
 * Route Layout Context
 * Sottoinsieme necessario per applicare layout
 */
export interface RouteLayoutContext {
  path: string;
  layout?: LayoutType;
}

/**
 * Route Group
 * Raggruppamento di rotte (es. per sidebar).
 */
export interface RouteGroup<TRole extends string = string> {
  name: string;

  /**
   * Ruoli permessi per il gruppo.
   * - `null`: Gruppo Pubblico
   * - `TRole[]`: Gruppo Protetto
   */
  allowedRoles: TRole[] | null;

  routes: RouteConfig<TRole>[];
  icon?: LucideIcon;
  order?: number;
}

/**
 * START STRICT CONFIGURATION TYPES
 * Helper types for type-safe configuration in routes.config.ts
 */

/**
 * Strict Guest Group
 * Forces allowedRoles to be NULL.
 * THESE ROUTES ARE FOR GUESTS ONLY (e.g. Login, Register).
 * Authenticated users will be redirected away from these routes.
 */
export type StrictGuestGroup<TRole extends string = string> = Omit<
  RouteGroup<TRole>,
  "allowedRoles"
> & {
  allowedRoles: null;
};

/**
 * Strict Protected Group
 * Forces allowedRoles to be TRole[] (not null)
 */
export type StrictProtectedGroup<TRole extends string = string> = Omit<
  RouteGroup<TRole>,
  "allowedRoles"
> & {
  allowedRoles: TRole[];
};
/** END STRICT CONFIGURATION TYPES */

/**
 * Sidebar Item
 * Rappresenta un elemento nella sidebar
 */
export interface SidebarItem {
  path: string;
  title: string;
  icon?: LucideIcon;
  order: number;
  description?: string;
  /** Funzione che ritorna il count per il badge (opzionale) */
  badgeCount?: () => number;
  /** Funzione che ritorna se c'è un timer attivo (opzionale) */
  hasActiveTimer?: () => boolean;
}

/**
 * Navigation Menu Item
 * Item generico per menu di navigazione
 */
export interface NavigationMenuItem {
  path: string;
  title: string;
  icon?: LucideIcon;
  order?: number;
  description?: string;
  children?: NavigationMenuItem[];
  /** Funzione che ritorna il count per il badge (opzionale) */
  badgeCount?: () => number;
  /** Funzione che ritorna se c'è un timer attivo (opzionale) */
  hasActiveTimer?: () => boolean;
}

/**
 * Sidebar Layout Configuration
 */
export interface SidebarLayoutConfig {
  title?: string;
  showSidebar?: boolean;
  sidebarWidth?: string;
  showTopbar?: boolean;
  showUserMenuInSidebar?: boolean;
  showUserMenuInTopbar?: boolean;
  logo?: ReactNode;
}

/**
 * User Menu Props
 */
export interface UserMenuProps {
  // User/Logout gestiti internamente dal componente o passati se necessario
  user?: User | null;
  onLogout?: () => void;

  // Props di presentazione
  variant?: string;
  avatarDisplay?: string;
  subtitleContent?: string;
  dropdownSide?: string;
  dropdownAlign?: string;
  showSettings?: boolean;
  showProfile?: boolean;
  showName?: boolean;
  showSubtitle?: boolean;
}
