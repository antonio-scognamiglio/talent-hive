import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { NavigationMenuItem } from "../types";
import { useSidebarTimerStatus } from "../hooks/useSidebarTimerStatus";
import { NavigationItemBadges } from "./NavigationItemBadges";
import { NavigationItemIndicators } from "./NavigationItemIndicators";

/**
 * Props per il componente NavigationMenu
 */
interface NavigationMenuProps {
  /** Items del menu */
  items: NavigationMenuItem[];

  /** Se il menu è in modalità mobile */
  isMobile?: boolean;

  /** Se la sidebar è collassata (icon-only mode) */
  isCollapsed?: boolean;

  /** Callback chiamato quando un item viene cliccato (utile per chiudere menu mobile) */
  onItemClick?: () => void;

  /** Classi CSS aggiuntive per il container */
  className?: string;

  /** Classi CSS aggiuntive per gli items */
  itemClassName?: string;

  /** Classi CSS per l'item attivo */
  activeItemClassName?: string;

  /** Se mostrare le descrizioni */
  showDescriptions?: boolean;
}

/**
 * Navigation Menu Component
 * Componente riutilizzabile per renderizzare menu di navigazione
 *
 * Features:
 * - Highlighting della rotta attiva
 * - Supporto per icone Lucide
 * - Responsive design
 * - Callback per click (utile per chiudere menu mobile)
 * - Styling customizzabile
 *
 * @example
 * <NavigationMenu
 *   items={sidebarItems}
 *   isMobile={isMobile}
 *   onItemClick={closeMobileMenu}
 *   className="space-y-1"
 *   itemClassName="px-3 py-2 rounded-md"
 * />
 */
export function NavigationMenu({
  items,
  isMobile = false,
  isCollapsed = false,
  onItemClick,
  className,
  itemClassName,
  activeItemClassName,
  showDescriptions = false,
}: NavigationMenuProps) {
  const location = useLocation();

  /**
   * Controlla se un path è attivo
   */
  const isActive = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <nav className={cn("flex-1 overflow-y-auto", className)}>
        <ul className={cn("space-y-1")}>
          {" "}
          {/* Stesso spacing per entrambi gli stati */}
          {items.map((item) => (
            <NavigationMenuItem
              key={item.path}
              item={item}
              isActive={isActive(item.path)}
              isMobile={isMobile}
              isCollapsed={isCollapsed}
              onItemClick={onItemClick}
              itemClassName={itemClassName}
              activeItemClassName={activeItemClassName}
              showDescriptions={showDescriptions}
            />
          ))}
        </ul>
      </nav>
    </TooltipProvider>
  );
}

/**
 * Componente per un singolo item del menu (estratto per usare hook)
 */
function NavigationMenuItem({
  item,
  isActive,
  isMobile,
  isCollapsed = false,
  onItemClick,
  itemClassName,
  activeItemClassName,
  showDescriptions,
}: {
  item: NavigationMenuItem;
  isActive: boolean;
  isMobile: boolean;
  isCollapsed?: boolean;
  onItemClick?: () => void;
  itemClassName?: string;
  activeItemClassName?: string;
  showDescriptions?: boolean;
}) {
  // Badge count: attualmente undefined, in futuro implementare logica qui
  const badgeCount = undefined;
  const timerStatus = useSidebarTimerStatus();
  const Icon = item.icon;

  const linkContent = (
    <Link
      to={item.path}
      className={cn(
        "flex items-center transition-colors duration-200",
        isCollapsed ? "justify-center h-11 w-full rounded-md" : "space-x-3", // w-full per riempire lo spazio disponibile
        "hover:bg-accent hover:text-accent-foreground",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground shadow-md":
            isActive,
          "text-muted-foreground": !isActive,
        },
        itemClassName,
        isActive && activeItemClassName,
      )}
      onClick={isMobile ? onItemClick : undefined}
    >
      {Icon && (
        <Icon className={cn("shrink-0", isCollapsed ? "h-5 w-5" : "h-5 w-5")} />
      )}
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0">
            <span className="font-medium truncate">{item.title}</span>
            {showDescriptions && item.description && (
              <p className="text-xs text-muted-foreground truncate">
                {item.description}
              </p>
            )}
          </div>
          <NavigationItemBadges
            activeTimersCount={timerStatus.activeTimersCount}
          />
        </>
      )}
      {isCollapsed && (
        <NavigationItemIndicators
          activeTimersCount={timerStatus.activeTimersCount}
        />
      )}
    </Link>
  );

  // Se collassata, avvolgi con tooltip
  if (isCollapsed && !isMobile) {
    return (
      <li className="relative">
        <Tooltip>
          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
          <TooltipContent side="right" className="ml-2">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{item.title}</span>
              {item.description && (
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
              )}
              {badgeCount !== undefined && badgeCount > 0 && (
                <span className="text-xs text-destructive">
                  {badgeCount} {badgeCount === 1 ? "notifica" : "notifiche"}
                </span>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </li>
    );
  }

  return <li className="relative">{linkContent}</li>;
}

/**
 * Compact Navigation Menu
 * Versione compatta per navbar orizzontale
 */
export function CompactNavigationMenu({
  items,
  onItemClick,
  className,
  itemClassName,
  activeItemClassName,
}: Omit<NavigationMenuProps, "isMobile" | "showDescriptions">) {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav className={cn("flex items-center space-x-1", className)}>
      {items.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.path);

        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
              "hover:bg-accent hover:text-accent-foreground",
              {
                "bg-primary text-primary-foreground hover:bg-primary/90":
                  active,
                "text-muted-foreground": !active,
              },
              itemClassName,
              active && activeItemClassName,
            )}
            onClick={onItemClick}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{item.title}</span>
          </Link>
        );
      })}
    </nav>
  );
}
