/**
 * ContentCard Component
 *
 * Card wrapper con header opzionale per badge, RefreshButton, e AddButton.
 * Usato principalmente con CustomTable quando non c'è Toolbar.
 *
 * Pattern:
 * - Se c'è Toolbar (filtri) → RefreshButton va nella Toolbar
 * - Se no Toolbar → RefreshButton va qui nel ContentCard header
 */

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RefreshButton, type RefreshButtonProps } from "./RefreshButton";
import { cn } from "@/lib/utils";

interface ContentCardProps extends React.PropsWithChildren {
  /**
   * Badge da mostrare nell'header della card (opzionale)
   * Se non fornito o array vuoto, i badge non vengono mostrati
   */
  badgeText?: string[];
  /**
   * Configurazione RefreshButton (opzionale)
   * Usare SOLO quando non c'è Toolbar nella pagina
   */
  refreshButton?: RefreshButtonProps;
  /**
   * Azione aggiuntiva a destra (opzionale)
   */
  rightAction?: React.ReactNode;
  /**
   * Classe CSS aggiuntiva
   */
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  children,
  badgeText,
  refreshButton,
  rightAction,
  className,
}) => {
  const safeBadgeText = Array.isArray(badgeText) ? badgeText : [];
  const hasBadges = safeBadgeText.length > 0;
  const hasHeader = hasBadges || refreshButton || rightAction;

  return (
    <Card className={cn("px-4 py-4 gap-4 flex flex-col", className)}>
      {/* Card Header */}
      {hasHeader && (
        <div className="flex items-center justify-between">
          {hasBadges && (
            <div className="flex items-center gap-2">
              {safeBadgeText.map((text, index) => (
                <Badge
                  variant="outline"
                  key={index}
                  className="py-2 rounded-md"
                >
                  {text}
                </Badge>
              ))}
            </div>
          )}
          <div className={cn("flex gap-2", !hasBadges && "ml-auto")}>
            {refreshButton && (
              <RefreshButton
                refetch={refreshButton.refetch}
                isLoading={refreshButton.isLoading}
              />
            )}
            {rightAction}
          </div>
        </div>
      )}
      {children}
    </Card>
  );
};
