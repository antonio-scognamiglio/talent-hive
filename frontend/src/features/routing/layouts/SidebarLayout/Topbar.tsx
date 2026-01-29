import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import type {
  SidebarLayoutConfig,
  UserMenuProps,
} from "@features/routing/types";

/**
 * Props per il componente Topbar
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface TopbarProps<TUser = any> {
  /** Configurazione del layout */
  config?: SidebarLayoutConfig;

  /** Se è in modalità mobile */
  isMobile?: boolean;

  /** Callback per aprire/chiudere la sidebar */
  onToggleSidebar?: () => void;

  /** Componente UserMenu con integrazione automatica */
  UserMenuComponent?: React.ComponentType<UserMenuProps>;

  /** Slot custom per UserMenu con controllo totale */
  userMenuSlot?: React.ReactNode;

  /** Utente corrente */
  user?: TUser;

  /** Componenti aggiuntivi da mostrare nella topbar */
  additionalActions?: React.ReactNode;

  /** Se mostrare il titolo nella topbar (default: true su mobile, false su desktop) */
  showTitle?: boolean;
}

/**
 * Topbar Component
 * Barra superiore dell'applicazione per layout con sidebar
 *
 * Features:
 * - Hamburger menu per mobile (apre sidebar)
 * - Titolo opzionale (default: mostrato su mobile, nascosto su desktop)
 * - Spazio a sinistra su desktop (pronto per ricerca globale futura)
 * - UserMenu opzionale
 * - Azioni aggiuntive customizzabili (theme toggle, language selector, ecc.)
 *
 * @example
 * <Topbar
 *   config={layoutConfig}
 *   isMobile={isMobile}
 *   onToggleSidebar={toggleSidebar}
 *   UserMenuComponent={UserMenu}
 *   user={user}
 *   additionalActions={<LanguageSelector />}
 *   showTitle={true} // Opzionale: sovrascrive il default (mobile=true, desktop=false)
 * />
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Topbar<TUser = any>({
  config,
  isMobile = false,
  onToggleSidebar,
  UserMenuComponent,
  userMenuSlot,
  user,
  additionalActions,
  showTitle,
}: TopbarProps<TUser>) {
  // Default: mostra titolo su mobile, nascondi su desktop
  const shouldShowTitle = showTitle !== undefined ? showTitle : isMobile;

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:px-6">
      {/* Left: Hamburger (mobile) e/o Title (se abilitato) */}
      <div className="flex items-center gap-3">
        {/* Hamburger Menu (mobile only) */}
        {isMobile && onToggleSidebar && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-primary hover:text-primary/80"
            aria-label="Apri menu di navigazione"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}

        {/* Title (mostrato su mobile di default, su desktop solo se showTitle=true) */}
        {shouldShowTitle && config?.title && (
          <h1 className="text-lg font-semibold text-foreground">
            {config.title}
          </h1>
        )}

        {/* Su desktop senza title: spazio vuoto (futuro: ricerca globale) */}
      </div>

      {/* Right: Azioni globali */}
      <div className="flex items-center gap-2">
        {/* Azioni aggiuntive */}
        {additionalActions}

        {/* UserMenu: Mostra solo se configurato */}
        {user && config?.showUserMenuInTopbar && (
          <div>
            {userMenuSlot ? (
              userMenuSlot
            ) : UserMenuComponent ? (
              <UserMenuComponent
                variant={isMobile ? "mobile-drawer" : "compact"}
                avatarDisplay="initials"
                showName={!isMobile}
                showSubtitle={false}
                dropdownSide="bottom"
                dropdownAlign="end"
                showSettings
                showProfile={false}
              />
            ) : null}
          </div>
        )}
      </div>
    </header>
  );
}
