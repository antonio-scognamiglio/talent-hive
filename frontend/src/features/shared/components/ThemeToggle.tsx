import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";

/**
 * ThemeToggle Component
 * Toggle button per cambiare rapidamente tra tema chiaro e scuro
 *
 * Comportamento:
 * - Se tema è "system", mostra l'icona del tema risolto e passa all'opposto al click
 * - Se tema è "light" o "dark", cicla tra light ↔ dark
 * - L'opzione "system" è gestibile solo dal Select in PreferencesSection
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Evita hydration mismatch - questo pattern è necessario per next-themes
  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  // Toggle tema: light ↔ dark
  const handleToggle = () => {
    if (!mounted) return;

    // Se è "system", passa all'opposto del tema risolto
    if (theme === "system") {
      const newTheme = resolvedTheme === "light" ? "dark" : "light";
      setTheme(newTheme);
      return;
    }

    // Cicla tra light e dark
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Icona in base al tema risolto (light/dark, non "system")
  const ThemeIcon = mounted && resolvedTheme === "dark" ? Moon : Sun;
  const themeLabel = mounted && resolvedTheme === "dark" ? "Scuro" : "Chiaro";

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleToggle}
      disabled={!mounted}
      className="flex items-center space-x-2"
      aria-label={`Cambia tema (attuale: ${themeLabel})`}
    >
      {mounted ? (
        <ThemeIcon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
