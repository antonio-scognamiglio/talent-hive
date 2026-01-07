import type { ReactNode } from "react";

/**
 * Layout Type
 * Tipi di layout disponibili
 */
export type LayoutType = "sidebar" | "navbar" | "minimal";

/**
 * Sidebar Layout Configuration
 * Configurazione per il layout con sidebar
 */
export interface SidebarLayoutConfig {
  /** Titolo dell'applicazione mostrato nella topbar */
  title?: string;

  /** Logo dell'applicazione */
  logo?: ReactNode;

  /** Larghezza della sidebar (in rem) */
  sidebarWidth?: number;

  /** Se mostrare la sidebar */
  showSidebar?: boolean;

  /** Se mostrare la topbar */
  showTopbar?: boolean;

  /** Se mostrare UserMenu nella sidebar */
  showUserMenuInSidebar?: boolean;

  /** Se mostrare UserMenu nella topbar */
  showUserMenuInTopbar?: boolean;
}

/**
 * Navbar Layout Configuration
 * Configurazione per il layout con navbar
 */
export interface NavbarLayoutConfig {
  /** Titolo dell'applicazione mostrato nella navbar */
  title?: string;

  /** Logo dell'applicazione */
  logo?: ReactNode;

  /** Se mostrare il footer */
  showFooter?: boolean;

  /** Se mostrare breadcrumbs */
  showBreadcrumbs?: boolean;

  /** Se mostrare UserMenu nella navbar */
  showUserMenu?: boolean;
}

/**
 * Layout Configuration
 * Configurazione generica per layout
 */
export interface LayoutConfig {
  /** Tipo di layout */
  type: LayoutType;

  /** Configurazione specifica per sidebar */
  sidebar?: SidebarLayoutConfig;

  /** Configurazione specifica per navbar */
  navbar?: NavbarLayoutConfig;
}

/**
 * Layout Wrapper Props
 * Props per il wrapper di layout
 */
export interface LayoutWrapperProps {
  children: ReactNode;
  config?: LayoutConfig;
  user?: unknown;
  onLogout?: () => void;
}

/**
 * User Menu Configuration
 * Configurazione per il menu utente
 */
export interface UserMenuConfig {
  /** Variante del menu */
  variant?: "default" | "compact" | "mobile-drawer";

  /** Come mostrare l'avatar */
  avatarDisplay?: "initials" | "image" | "icon";

  /** Se mostrare il nome utente */
  showName?: boolean;

  /** Se mostrare il sottotitolo (ruolo) */
  showSubtitle?: boolean;

  /** Contenuto del sottotitolo */
  subtitleContent?: "role" | "email" | "custom";

  /** Lato del dropdown */
  dropdownSide?: "top" | "bottom" | "left" | "right";

  /** Allineamento del dropdown */
  dropdownAlign?: "start" | "center" | "end";

  /** Se mostrare link alle impostazioni */
  showSettings?: boolean;

  /** Se mostrare link al profilo */
  showProfile?: boolean;
}

/**
 * UserMenu Types
 * Tipi per il componente UserMenu (disponibili anche senza copiare il componente)
 */

/**
 * Varianti del componente UserMenu
 */
export type UserMenuVariant =
  | "default"
  | "compact"
  | "minimal"
  | "mobile-drawer";

/**
 * Opzioni per la visualizzazione dell'avatar
 */
export type AvatarDisplay = "initials" | "icon" | "image";

/**
 * Dimensioni dell'avatar
 */
export type AvatarSize = "sm" | "md" | "lg";

/**
 * Contenuto del sottotitolo
 */
export type SubtitleContent = "role" | "email" | "custom";

/**
 * Posizione del dropdown
 */
export type DropdownSide = "top" | "bottom" | "left" | "right";

/**
 * Allineamento del dropdown
 */
export type DropdownAlign = "start" | "center" | "end";

/**
 * Configurazione di un menu item
 */
export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
}

/**
 * Props del componente UserMenu
 * Disponibile anche senza copiare il componente UserMenu
 */
export interface UserMenuProps {
  // Display Options
  variant?: UserMenuVariant;

  // Avatar Options
  showAvatar?: boolean;
  avatarDisplay?: AvatarDisplay;
  avatarSize?: AvatarSize;

  // Text Options
  showName?: boolean;
  showSubtitle?: boolean;
  subtitleContent?: SubtitleContent;
  customSubtitle?: string;
  customTitle?: string;

  // Dropdown Options
  dropdownSide?: DropdownSide;
  dropdownAlign?: DropdownAlign;

  // Menu Items
  menuItems?: MenuItemConfig[];

  // Feature Toggles
  showSettings?: boolean;
  showProfile?: boolean;
  showLogout?: boolean;

  // Styling
  className?: string;
  avatarClassName?: string;

  // User Data (opzionale, per integrazione con AuthContext)
  user?: {
    id?: string;
    name?: string;
    email?: string;
    role?: string;
    photoUrl?: string;
    initials?: string;
  };

  // Callbacks
  onLogout?: () => void;
  onSettings?: () => void;
  onProfile?: () => void;
}
