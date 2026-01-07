import { useState, useCallback } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useSidebarCollapse } from "../../hooks/useSidebarCollapse";
import type {
  RouteConfig,
  SidebarLayoutConfig,
  UserMenuProps,
} from "@features/routing/types";

/**
 * Props per il componente SidebarLayout
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface SidebarLayoutProps<TRole extends string, TUser = any> {
  /** Contenuto da renderizzare */
  children: React.ReactNode;

  /** Configurazione del layout */
  config?: SidebarLayoutConfig;

  /** Utente corrente */
  user?: TUser;

  /** Rotte accessibili per il ruolo */
  routes: RouteConfig<TRole>[];

  /**
   * Componente UserMenu con integrazione automatica.
   * SidebarLayout gestirà variant, positioning e props contestuali.
   * Usa questo per il componente UserMenu fornito da tera-lib.
   */
  UserMenuComponent?: React.ComponentType<UserMenuProps>;

  /**
   * Slot custom per UserMenu con controllo totale.
   * Passa un ReactNode generico che verrà renderizzato as-is.
   * Ha priorità su UserMenuComponent se entrambi sono forniti.
   * Usa questo per componenti completamente custom.
   */
  userMenuSlot?: React.ReactNode;

  /** Componenti aggiuntivi da mostrare nella topbar */
  additionalActions?: React.ReactNode;

  /** Se è in modalità mobile (opzionale, default: false) */
  isMobile?: boolean;
}

/**
 * Sidebar Layout Component
 * Layout completo con sidebar e topbar
 *
 * Struttura:
 * ┌─────────────────────────────────┐
 * │ TOPBAR (hamburger + actions)    │
 * ├────────┬────────────────────────┤
 * │SIDEBAR │ MAIN CONTENT           │
 * │        │                        │
 * │ Nav    │ {children}             │
 * │ Items  │                        │
 * │        │                        │
 * │ User   │                        │
 * │ Menu   │                        │
 * └────────┴────────────────────────┘
 *
 * Features:
 * - Sidebar fissa su desktop, sheet su mobile
 * - Topbar con hamburger menu per mobile
 * - UserMenu posizionabile (sidebar/topbar)
 * - Responsive design automatico
 * - Navigazione basata su ruoli
 *
 * @example
 * <SidebarLayout
 *   config={layoutConfig}
 *   user={user}
 *   userRole={user.role}
 *   routes={userRoutes}
 *   UserMenuComponent={UserMenu}
 *   onLogout={handleLogout}
 * >
 *   <DashboardContent />
 * </SidebarLayout>
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function SidebarLayout<TRole extends string, TUser = any>({
  children,
  config,
  user,
  routes,
  UserMenuComponent,
  userMenuSlot,
  additionalActions,
  isMobile = false,
}: SidebarLayoutProps<TRole, TUser>) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Hook per gestire collasso sidebar (solo desktop)
  const { isCollapsed, toggleCollapse } = useSidebarCollapse();

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  // Se non c'è configurazione, mostra solo children
  if (!config) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar (se abilitata) */}
      {config.showSidebar !== false && (
        <Sidebar
          config={config}
          user={user}
          routes={routes}
          isOpen={isSidebarOpen}
          onClose={closeSidebar}
          isMobile={isMobile}
          isCollapsed={isCollapsed}
          onToggleCollapse={toggleCollapse}
          UserMenuComponent={UserMenuComponent}
          userMenuSlot={userMenuSlot}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Topbar (se abilitata) */}
        {config.showTopbar !== false && (
          <Topbar
            config={config}
            isMobile={isMobile}
            onToggleSidebar={toggleSidebar}
            UserMenuComponent={UserMenuComponent}
            userMenuSlot={userMenuSlot}
            user={user}
            additionalActions={additionalActions}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
