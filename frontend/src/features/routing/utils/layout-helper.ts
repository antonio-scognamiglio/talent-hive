import type { RouteLayoutContext } from "../types";

/**
 * Layout Wrapper Function Type
 * Funzione che applica un layout a un contenuto in base alla configurazione della route
 */
export type LayoutWrapperFn = (
  children: React.ReactNode,
  route: RouteLayoutContext
) => React.ReactNode;

/**
 * Apply Layout to Route
 * Helper condiviso per applicare layout a una route in modo consistente
 *
 * Usato da:
 * - RoleBasedRouter (per rotte protette)
 * - AppRoutes (per rotte guest/pubbliche)
 *
 * @param content - Il contenuto da wrappare
 * @param route - La configurazione della route (path + layout)
 * @param layoutWrapper - La funzione che applica il layout
 * @returns Il contenuto wrappato nel layout se specificato, altrimenti il contenuto originale
 */
export function applyLayoutToRoute(
  content: React.ReactNode,
  route: RouteLayoutContext,
  layoutWrapper: LayoutWrapperFn
): React.ReactNode {
  return route.layout ? layoutWrapper(content, route) : content;
}
