import { apiClient } from "./client";

/**
 * Response interceptor: gestisci 401 (unauthorized)
 * Quando il cookie scade o è invalido, redirect a login
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Check se siamo già nel flow di auth per evitare loop
    const currentPath = window.location.pathname;
    const isOnAuthPage = currentPath.startsWith("/auth");

    if (error.response?.status === 401) {
      // Redirect solo se NON siamo già sulle pagine di auth
      if (!isOnAuthPage) {
        window.location.href = "/auth/login";
      }
    }
    return Promise.reject(error);
  }
);
