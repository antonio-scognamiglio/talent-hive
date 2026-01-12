import type { ComponentType, LazyExoticComponent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { User } from "@shared/types/index";

/**
 * Route Configuration
 * Definisce la struttura di una singola rotta nell'applicazione
 */
export interface RouteConfig<TRole extends string = string> {
  /** Path della rotta (es. "/clients", "/cases/:id") */
  path: string;

  /** Componente React da renderizzare (lazy loaded) */
  element: LazyExoticComponent<ComponentType>;

  /** Ruoli autorizzati ad accedere a questa rotta */
  allowedRoles: TRole[];

  /** Permessi granulari opzionali (es. ["documents:delete"]) */
  requiredPermissions?: string[];

  /** Layout da utilizzare per questa rotta */
  layout?: "sidebar" | "navbar" | "minimal" | null;

  /** Metadata per sidebar, breadcrumbs, ecc. */
  meta?: {
    /** Titolo della pagina */
    title: string;

    /** Icona (Lucide) per la sidebar */
    icon?: LucideIcon;

    /** Se mostrare questa rotta nella sidebar */
    showInSidebar?: boolean;

    /** Ordine nella sidebar (1 = primo) */
    sidebarOrder?: number;

    /** Descrizione breve per tooltip */
    description?: string;

    /** Se questa è una rotta nascosta (non appare in nessun menu) */
    hidden?: boolean;

    /** Funzione che ritorna il count per il badge (opzionale) */
    badgeCount?: () => number;

    /** Funzione che ritorna se c'è un timer attivo (opzionale) */
    hasActiveTimer?: () => boolean;
  };
}

/**
 * Route Group
 * Raggruppa rotte correlate logicamente
 */
export interface RouteGroup<TRole extends string = string> {
  /** Nome del gruppo (es. "Dashboard", "Gestione Clienti") */
  name: string;

  /** Rotte appartenenti a questo gruppo */
  routes: RouteConfig<TRole>[];

  /** Ruoli che possono accedere a questo gruppo */
  allowedRoles: TRole[];

  /** Icona del gruppo (opzionale) */
  icon?: LucideIcon;

  /** Ordine del gruppo nella sidebar */
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
