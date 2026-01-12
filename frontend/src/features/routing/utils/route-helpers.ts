import type {
  LayoutType,
  RouteConfig,
  RouteGroup,
  SidebarItem,
} from "../types";

/**
 * Ottiene tutte le rotte accessibili per un determinato ruolo
 * @param routeGroups Array di gruppi di rotte
 * @param userRole Ruolo dell'utente
 * @returns Array di rotte accessibili per il ruolo
 */
export function getRoutesForRole<TRole extends string>(
  routeGroups: RouteGroup<TRole>[],
  userRole: TRole
): RouteConfig<TRole>[] {
  return routeGroups
    .filter((group) => {
      // Se allowedRoles è null, il gruppo è pubblico
      if (!group.allowedRoles) return true;
      // Altrimenti controlla se l'utente ha il ruolo
      return group.allowedRoles.includes(userRole);
    })
    .flatMap((group) => group.routes)
    .filter((route) => {
      // Se allowedRoles è null, la rotta è pubblica
      if (!route.allowedRoles) return true;
      // Altrimenti controlla se l'utente ha il ruolo
      return route.allowedRoles.includes(userRole);
    });
}

/**
 * Ottiene gli items per la sidebar filtrati per ruolo
 * @param routes Array di rotte
 * @returns Array di items per la sidebar ordinati
 */
export function getSidebarItemsForRole<TRole extends string>(
  routes: RouteConfig<TRole>[]
): SidebarItem[] {
  return routes
    .filter((route) => route.meta?.showInSidebar)
    .sort((a, b) => {
      const orderA = a.meta?.sidebarOrder ?? 999;
      const orderB = b.meta?.sidebarOrder ?? 999;
      return orderA - orderB;
    })
    .map((route) => ({
      path: route.path,
      title: route.meta!.title,
      icon: route.meta!.icon,
      order: route.meta!.sidebarOrder ?? 999,
      description: route.meta?.description,
    }));
}

/**
 * Verifica se un ruolo ha accesso a un determinato path
 * @param route Rotta da verificare
 * @param userRole Ruolo dell'utente
 * @returns True se l'utente ha accesso alla rotta
 */
export function canAccessRoute<TRole extends string>(
  route: RouteConfig<TRole>,
  userRole: TRole
): boolean {
  if (route.allowedRoles) {
    return route.allowedRoles.includes(userRole);
  }
  return true;
}

/**
 * Verifica se un ruolo ha accesso a un determinato path
 * @param routeGroups Array di gruppi di rotte
 * @param path Path da verificare
 * @param userRole Ruolo dell'utente
 * @returns True se l'utente ha accesso al path
 */
export function canAccessPath<TRole extends string>(
  routeGroups: RouteGroup<TRole>[],
  path: string,
  userRole: TRole
): boolean {
  const routes = getRoutesForRole(routeGroups, userRole);
  return routes.some((route) => route.path === path);
}

/**
 * Ottiene la configurazione di una rotta specifica
 * @param routeGroups Array di gruppi di rotte
 * @param path Path della rotta
 * @param userRole Ruolo dell'utente
 * @returns Configurazione della rotta o undefined se non trovata/accessibile
 */
export function getRouteConfig<TRole extends string>(
  routeGroups: RouteGroup<TRole>[],
  path: string,
  userRole: TRole
): RouteConfig<TRole> | undefined {
  const routes = getRoutesForRole(routeGroups, userRole);
  return routes.find((route) => route.path === path);
}

/**
 * Ottiene il titolo di una rotta
 * @param routeGroups Array di gruppi di rotte
 * @param path Path della rotta
 * @param userRole Ruolo dell'utente
 * @returns Titolo della rotta o undefined se non trovata
 */
export function getRouteTitle<TRole extends string>(
  routeGroups: RouteGroup<TRole>[],
  path: string,
  userRole: TRole
): string | undefined {
  const route = getRouteConfig(routeGroups, path, userRole);
  return route?.meta?.title;
}

/**
 * Filtra le rotte per layout
 * @param routes Array di rotte
 * @param layout Tipo di layout
 * @returns Array di rotte con il layout specificato
 */
export function filterRoutesByLayout<TRole extends string>(
  routes: RouteConfig<TRole>[],
  layout: LayoutType
): RouteConfig<TRole>[] {
  return routes.filter((route) => route.layout === layout);
}

/**
 * Ottiene le rotte raggruppate per layout
 * @param routes Array di rotte
 * @returns Oggetto con rotte raggruppate per layout
 */
export function groupRoutesByLayout<TRole extends string>(
  routes: RouteConfig<TRole>[]
): {
  sidebar: RouteConfig<TRole>[];
  navbar: RouteConfig<TRole>[];
  guest: RouteConfig<TRole>[];
  none: RouteConfig<TRole>[];
} {
  return {
    sidebar: filterRoutesByLayout(routes, "sidebar"),
    navbar: filterRoutesByLayout(routes, "navbar"),
    guest: filterRoutesByLayout(routes, "guest"),
    none: filterRoutesByLayout(routes, null),
  };
}

/**
 * Trova la rotta corrente in base al pathname
 * @param routes Array di rotte
 * @param pathname Path corrente
 * @returns La rotta corrispondente o undefined
 */
export function getCurrentRoute<TRole extends string>(
  routes: RouteConfig<TRole>[],
  pathname: string
): RouteConfig<TRole> | undefined {
  // Cerca la rotta che matcha esattamente il pathname
  // Per gestire route dinamiche (/clients/:id), dovremmo usare matchPath
  // ma per semplicità iniziamo con un match esatto
  return routes.find((route) => {
    // Match esatto per rotte statiche
    if (route.path === pathname) return true;

    // Match per root path
    if (route.path === "/" && pathname === "/") return true;

    // Per ora, match semplice
    // TODO: Usare matchPath di react-router-dom per route dinamiche
    return false;
  });
}
