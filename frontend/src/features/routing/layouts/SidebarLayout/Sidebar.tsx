import { Link } from "react-router-dom";
import { Logo } from "@/features/shared/components/Logo";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { NavigationMenu } from "../../components/NavigationMenu";
import { SidebarToggle } from "./SidebarToggle";
import { getSidebarItemsForRole } from "../../utils";
import { cn } from "@/lib/utils";
import type {
  RouteConfig,
  SidebarLayoutConfig,
  UserMenuProps,
} from "../../types";

/**
 * Props per il componente Sidebar
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SidebarProps<TRole extends string, TUser = any> {
  /** Configurazione del layout */
  config?: SidebarLayoutConfig;

  /** Utente corrente */
  user?: TUser;

  /** Rotte accessibili per il ruolo */
  routes: RouteConfig<TRole>[];

  /** Se il menu è aperto (per mobile) */
  isOpen?: boolean;

  /** Callback per chiudere il menu (mobile) */
  onClose?: () => void;

  /** Se è in modalità mobile */
  isMobile?: boolean;

  /** Se la sidebar è collassata (solo desktop, icon-only mode) */
  isCollapsed?: boolean;

  /** Callback per toggle collasso (solo desktop) */
  onToggleCollapse?: () => void;

  /** Componente UserMenu con integrazione automatica */
  UserMenuComponent?: React.ComponentType<UserMenuProps>;

  /** Slot custom per UserMenu con controllo totale */
  userMenuSlot?: React.ReactNode;
}

/**
 * Sidebar Component
 * Sidebar dell'applicazione con navigazione filtrata per ruolo
 *
 * Features:
 * - Navigazione dinamica basata sul ruolo
 * - Highlighting della rotta attiva
 * - Icone lucide per ogni voce
 * - Responsive design: Sheet su mobile, Fixed su desktop
 * - UserMenu integrato nel footer
 *
 * @example
 * <Sidebar
 *   config={layoutConfig}
 *   user={user}
 *   userRole={user.role}
 *   routes={userRoutes}
 *   isMobile={isMobile}
 *   onClose={closeSidebar}
 * />
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Sidebar<TRole extends string, TUser = any>({
  config,
  user,
  routes,
  isOpen = true,
  onClose,
  isMobile = false,
  isCollapsed = false,
  onToggleCollapse,
  UserMenuComponent,
  userMenuSlot,
}: SidebarProps<TRole, TUser>) {
  // Genera sidebar items dal routes
  const sidebarItems = getSidebarItemsForRole(routes);

  // Su mobile, forziamo sempre la sidebar estesa (ignoriamo isCollapsed)
  // perché i tooltip non sono ben supportati su mobile
  const effectiveIsCollapsed = isMobile ? false : isCollapsed;

  /**
   * Sidebar Content Component
   * Contenuto della sidebar (riutilizzato per mobile e desktop)
   */
  const SidebarContent = () => (
    <div className="flex flex-col h-full relative">
      {/* Logo / Header */}
      <div
        className={cn(
          "flex items-center justify-center h-16 border-b border-border transition-all duration-200",
          effectiveIsCollapsed ? "px-2" : "px-4"
        )}
      >
        <Link
          to="/"
          className="flex items-center text-primary hover:text-primary/80 transition-colors"
          onClick={isMobile ? onClose : undefined}
        >
          {config?.logo || <Logo size={48} className="block" />}
          {config?.logo ? null : (
            <span
              className={cn(
                "font-bold transition-all duration-200",
                effectiveIsCollapsed ? "hidden" : "text-xl"
              )}
            >
              {config?.title || "App"}
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <NavigationMenu
        items={sidebarItems}
        isMobile={isMobile}
        isCollapsed={effectiveIsCollapsed}
        onItemClick={isMobile ? onClose : undefined}
        className={cn(
          "transition-all duration-200",
          "py-4 px-2" // Stesso padding per entrambi gli stati
        )}
        itemClassName={cn(
          "transition-all duration-200",
          effectiveIsCollapsed ? "" : "px-3 py-2.5 rounded-md" // Solo padding, no margin
        )}
      />

      {/* User Menu Footer (nascosto su mobile, avatar in topbar) */}
      {config?.showUserMenuInSidebar && user && !effectiveIsCollapsed && (
        <div className="border-t border-border p-3">
          {userMenuSlot ? (
            userMenuSlot
          ) : UserMenuComponent ? (
            <UserMenuComponent
              variant="default"
              avatarDisplay="initials"
              subtitleContent="role"
              dropdownSide="top"
              dropdownAlign="end"
              showSettings
              showProfile={false}
            />
          ) : null}
        </div>
      )}
    </div>
  );

  // Mobile: Sheet overlay
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu di navigazione</SheetTitle>
            <SheetDescription>
              Menu principale dell'applicazione con navigazione e impostazioni
              utente
            </SheetDescription>
          </SheetHeader>
          <SidebarContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Fixed sidebar
  // Su mobile, la sidebar è sempre estesa (ignoriamo isCollapsed)
  const sidebarWidth = config?.sidebarWidth || 16; // 16rem = 256px default
  const collapsedWidth = 4; // 4rem = 64px quando collassata (icon-only)
  const currentWidth = effectiveIsCollapsed ? collapsedWidth : sidebarWidth;

  return (
    <aside
      className="relative border-r border-border bg-card h-screen transition-all duration-200 ease-in-out"
      style={{ width: `${currentWidth}rem` }}
    >
      <SidebarContent />

      {/* Toggle Button - solo desktop, non mobile */}
      {!isMobile && onToggleCollapse && (
        <SidebarToggle isCollapsed={isCollapsed} onToggle={onToggleCollapse} />
      )}
    </aside>
  );
}
