import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/features/shared";
import { AuthProvider } from "@/features/auth/context/AuthProvider";
import { AppRoutes } from "@/features/routing/components/AppRoutes";
import { GuestRoute } from "@/features/routing/components/GuestRoute";
import Auth from "@/pages/auth/Auth";
import { MinimalLayout } from "./features/routing/layouts/MinimalLayout";

/**
 * App Component
 * Root component con provider stack
 */
function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      storageKey="talenthive-theme"
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <BrowserRouter>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <Routes>
                {/* Guest only routes */}
                <Route
                  path="/auth"
                  element={
                    <MinimalLayout>
                      <GuestRoute>
                        <Auth />
                      </GuestRoute>
                    </MinimalLayout>
                  }
                />

                {/* Protected Routes: Dynamically generated based on user role */}
                <Route path="/*" element={<AppRoutes />} />
              </Routes>
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
