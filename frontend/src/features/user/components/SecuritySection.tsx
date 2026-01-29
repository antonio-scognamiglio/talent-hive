import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Key, Edit } from "lucide-react";
import { useDialog } from "@/features/shared/hooks/useDialog";
import { ChangePasswordDialog } from "./ChangePasswordDialog";

/**
 * SecuritySection Component
 * Section for security settings in the Settings page
 */
export function SecuritySection() {
  const { isShown, openDialog, closeDialog } = useDialog();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sicurezza Account</CardTitle>
          <CardDescription>
            Gestisci le impostazioni di sicurezza del tuo account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Password Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-muted-foreground" />
                <div>
                  <Label className="text-base font-semibold">Password</Label>
                  <p className="text-sm text-muted-foreground">
                    Modifica la password del tuo account
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={openDialog}>
                <Edit className="h-4 w-4 mr-2" />
                Modifica
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {isShown && (
        <ChangePasswordDialog isOpen={isShown} onClose={closeDialog} />
      )}
    </div>
  );
}
