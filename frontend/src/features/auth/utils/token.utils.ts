import { authService } from "@/features/shared/services/auth.service";

// Timer for automatic refresh
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

// Time before expiry to refresh (in milliseconds)
const REFRESH_BEFORE_EXPIRY = 55 * 60 * 1000; // 55 minutes

/**
 * Starts the token refresh timer
 */
export const startTokenRefreshTimer = (): void => {
  stopTokenRefreshTimer();

  refreshTimer = setTimeout(async () => {
    try {
      await authService.refresh();
      startTokenRefreshTimer();
    } catch (error) {
      console.error("Error refreshing token:", error);
    }
  }, REFRESH_BEFORE_EXPIRY);
};

/**
 * Stops the token refresh timer
 */
export const stopTokenRefreshTimer = (): void => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};
