import { ThemeToggle } from "@/features/shared/components/ThemeToggle";
import { Label } from "@/components/ui/label";

export const PreferencesSection = () => {
  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-medium mb-1">Preferenze</h2>
      <p className="text-muted-foreground mb-6 text-sm">
        Personalizza l'aspetto dell'applicazione.
      </p>

      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label>Tema Applicazione</Label>
          <p className="text-sm text-muted-foreground">
            Scegli tra tema chiaro o scuro.
          </p>
        </div>
        <ThemeToggle />
      </div>
    </div>
  );
};
