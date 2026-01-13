import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@shared/types/index";

/**
 * Layout Type
 * Tipi di layout disponibili per le rotte
 */
export type LayoutType = "sidebar" | "navbar" | "minimal" | null;

/**
 * Route Configuration
 * Unica interfaccia per tutte le rotte.
 */
export interface RouteConfig<TRole extends string = string> {
  path: string;
  element: LazyExoticComponent<ComponentType>;
  layout?: LayoutType;
  requiredPermissions?: string[];

  /** Ruoli autorizzati ad accedere a questa rotta */
  allowedRoles: TRole[];

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

  /** Ruoli autorizzati ad accedere a questa rotta */
  allowedRoles: TRole[];

  routes: RouteConfig<TRole>[];
  icon?: LucideIcon;
  order?: number;
}

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
