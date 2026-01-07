import { useState } from "react";
import { ChevronUp, Info, LogOut, Settings, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { Separator } from "@/components/ui/separator";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";
import { useProfilePicture } from "@/features/user/hooks/useProfilePicture";
import { getRoleDisplayName } from "../types/roles.types";
import { cn } from "@/lib/utils";

/**
 * Menu Item Configuration
 */
export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  variant?: "default" | "destructive";
}

/**
 * UserMenu Props Interface
 */
export interface UserMenuProps {
  // Display Options
  variant?: "default" | "compact" | "minimal" | "mobile-drawer";

  // Avatar Options
  showAvatar?: boolean;
  avatarDisplay?: "initials" | "icon" | "image";
  avatarSize?: "sm" | "md" | "lg";

  // Text Options
  showName?: boolean;
  showSubtitle?: boolean;
  subtitleContent?: "email" | "role" | "custom";
  customSubtitle?: string;
  customTitle?: string;

  // Dropdown Options
  showDropdown?: boolean;
  dropdownSide?: "top" | "bottom" | "left" | "right";
  dropdownAlign?: "start" | "center" | "end";

  // Menu Items (customizable)
  showSettings?: boolean;
  showProfile?: boolean;
  customMenuItems?: MenuItemConfig[];

  // Style
  className?: string;
  buttonClassName?: string;
  avatarClassName?: string;

  // Callbacks
  onLogout?: () => void;
  onMenuItemClick?: (itemId: string) => void;
}

/**
 * UserMenu Component
 * Componente flessibile per la gestione del menu utente
 *
 * Features:
 * - Avatar personalizzabile (initials, icon, image)
 * - Testo configurabile (nome, sottotitolo)
 * - Dropdown opzionale con menu items custom
 * - Varianti responsive (default, compact, minimal)
 * - Styling completamente personalizzabile
 *
 * Usage:
 * ```tsx
 * // Sidebar (default)
 * <UserMenu variant="default" subtitleContent="role" />
 *
 * // Topbar (minimal)
 * <UserMenu variant="minimal" showDropdown={false} />
 *
 * // Custom menu items
 * <UserMenu customMenuItems={[...]} />
 * ```
 */
export const UserMenu: React.FC<UserMenuProps> = ({
  // Display
  variant = "default",

  // Avatar
  showAvatar = true,
  avatarDisplay = "initials",
  avatarSize = "md",

  // Text
  showName = true,
  showSubtitle = true,
  subtitleContent = "role",
  customSubtitle,
  customTitle,

  // Dropdown
  showDropdown = true,
  dropdownSide = "top",
  dropdownAlign = "end",

  // Menu Items
  showSettings = true,
  showProfile = true,
  customMenuItems = [],

  // Style
  className,
  buttonClassName,
  avatarClassName,

  // Callbacks
  onLogout,
  onMenuItemClick,
}) => {
  const { user: me, userRole, logout } = useAuthContext();
  const [open, setOpen] = useState(false);

  // Get profile picture URL
  const { profilePictureUrl } = useProfilePicture();

  if (!me) return null;

  // Compute values
  const displayTitle = customTitle || `${me.firstName} ${me.lastName}`;
  const displaySubtitle =
    customSubtitle ||
    (subtitleContent === "email"
      ? me.email
      : userRole
      ? getRoleDisplayName(userRole)
      : "");

  // Handle logout (deve essere definito prima del variant mobile-drawer)
  const handleLogout = async () => {
    if (onLogout) {
      onLogout();
    } else {
      await logout();
    }
  };

  // Mobile Drawer Variant
  if (variant === "mobile-drawer") {
    return (
      <>
        {/* Trigger: Avatar button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          className="rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={profilePictureUrl || undefined} />
            <AvatarFallback
              className="bg-primary/10 text-primary font-semibold"
              firstName={me.firstName}
              lastName={me.lastName}
            />
          </Avatar>
        </Button>

        {/* Bottom Sheet */}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader className="sr-only">
              <DrawerTitle>Account</DrawerTitle>
              <DrawerDescription>
                Gestisci il tuo account e le impostazioni
              </DrawerDescription>
            </DrawerHeader>

            {/* Menu Actions - TUTTO con stesso stile */}
            <div className="p-4 space-y-1">
              {/* User Info - STESSO STILE dei menu items */}
              <div className="w-full flex items-start cursor-default py-2 px-4 gap-2">
                <Info className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="font-medium wrap-break-word w-full">
                    {me.firstName} {me.lastName}
                  </span>
                  <span className="text-xs text-muted-foreground break-all w-full">
                    {me.email}
                  </span>
                </div>
              </div>

              <Separator className="my-2" />
              {showSettings && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Impostazioni
                  </Link>
                </Button>
              )}

              {showProfile && (
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  asChild
                  onClick={() => setOpen(false)}
                >
                  <Link to="/settings?tab=profile">
                    <User className="mr-2 h-4 w-4" />
                    Il mio profilo
                  </Link>
                </Button>
              )}

              {/* Custom menu items */}
              {customMenuItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="w-full justify-start"
                  asChild={!!item.href}
                  onClick={() => {
                    item.onClick?.();
                    onMenuItemClick?.(item.id);
                    setOpen(false);
                  }}
                >
                  {item.href ? (
                    <Link to={item.href}>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.label}
                    </Link>
                  ) : (
                    <>
                      {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                      {item.label}
                    </>
                  )}
                </Button>
              ))}

              <Separator className="my-2" />

              {/* Logout */}
              <Button
                variant="ghost"
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  // Avatar sizes
  const avatarSizes = {
    sm: "h-7 w-7",
    md: "h-9 w-9",
    lg: "h-11 w-11",
  };

  // Render Avatar
  const renderAvatar = () => {
    if (!showAvatar) return null;

    const sizeClass = avatarSizes[avatarSize];

    return (
      <Avatar className={cn(sizeClass, avatarClassName)}>
        {profilePictureUrl && avatarDisplay !== "icon" && (
          <AvatarImage src={profilePictureUrl} />
        )}
        {avatarDisplay === "icon" ? (
          <AvatarFallback className="bg-primary/10">
            <User className="h-4 w-4 text-primary" />
          </AvatarFallback>
        ) : (
          <AvatarFallback
            className="bg-primary/10 text-primary font-semibold"
            firstName={me.firstName}
            lastName={me.lastName}
          />
        )}
      </Avatar>
    );
  };

  // Button Content
  const buttonContent = (
    <>
      {renderAvatar()}

      {(showName || showSubtitle) && variant !== "minimal" && (
        <div className="flex-1 text-left min-w-0 overflow-hidden">
          {showName && (
            <p className="text-sm font-medium wrap-break-word whitespace-normal">
              {displayTitle}
            </p>
          )}
          {showSubtitle && (
            <p className="text-xs text-muted-foreground break-all whitespace-normal">
              {displaySubtitle}
            </p>
          )}
        </div>
      )}

      {showDropdown && variant === "default" && (
        <ChevronUp className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
      )}
    </>
  );

  // If no dropdown, just render button
  if (!showDropdown) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        {buttonContent}
      </div>
    );
  }

  // Default menu items
  const defaultMenuItems: MenuItemConfig[] = [];

  if (showSettings) {
    defaultMenuItems.push({
      id: "settings",
      label: "Impostazioni",
      icon: Settings,
      href: "/settings",
    });
  }

  if (showProfile) {
    defaultMenuItems.push({
      id: "profile",
      label: "Il mio profilo",
      icon: User,
      href: "/settings?tab=profile",
    });
  }

  const allMenuItems = [...defaultMenuItems, ...customMenuItems];

  // With dropdown
  return (
    <div className={className}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 *:whitespace-normal",
              variant === "default" && "h-auto py-3",
              variant === "compact" && "h-10 py-2",
              variant === "minimal" && "h-9 w-9 p-0 justify-center",
              buttonClassName
            )}
          >
            {buttonContent}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          side={dropdownSide}
          align={dropdownAlign}
          className="w-56"
        >
          {/* User info header */}
          <DropdownMenuLabel>
            <div className="flex flex-col gap-1 min-w-0">
              <p className="text-sm font-medium wrap-break-word whitespace-normal">
                {displayTitle}
              </p>
              <p className="text-xs text-muted-foreground break-all whitespace-normal">
                {me.email}
              </p>
            </div>
          </DropdownMenuLabel>

          {allMenuItems.length > 0 && <DropdownMenuSeparator />}

          {/* Menu items */}
          {allMenuItems.map((item) => (
            <DropdownMenuItem
              key={item.id}
              asChild={!!item.href}
              onClick={() => {
                item.onClick?.();
                onMenuItemClick?.(item.id);
              }}
              className={
                item.variant === "destructive"
                  ? "text-destructive focus:text-destructive"
                  : ""
              }
            >
              {item.href ? (
                <Link to={item.href}>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </Link>
              ) : (
                <>
                  {item.icon && <item.icon className="mr-2 h-4 w-4" />}
                  {item.label}
                </>
              )}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          {/* Logout */}
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
