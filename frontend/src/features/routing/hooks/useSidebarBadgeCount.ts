import { useMemo } from "react";
import type { NavigationMenuItem } from "../types";
import { useAuthContext } from "@/features/auth/hooks/useAuthContext";

/**
 * Hook per ottenere il badge count per un item della sidebar
 * @param item - Item della sidebar
 * @returns Count del badge o 0 se non presente
 */
export function useSidebarBadgeCount(item: NavigationMenuItem): number {
  const { user } = useAuthContext();

  return useMemo(() => {
    // ATS specific logic to be implemented here
    // Example:
    // if (item.path === "/applications" && userRole === "RECRUITER") {
    //   return pendingApplicationsCount; 
    // }

    return 0;
  }, [item, user]);
}
