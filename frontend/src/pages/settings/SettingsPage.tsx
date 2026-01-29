import { useSearchParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings as SettingsIcon } from "lucide-react";
import { useAuthContext } from "@/features/auth";
import { PageContent, PageHeader } from "@/features/shared/components/layout";
import { SecuritySection } from "@/features/user/components/SecuritySection";
import { ProfileSection } from "@/features/user/components/ProfileSection";
import { PreferencesSection } from "@/features/user/components/PreferencesSection";

// Defines the available tabs constant for typo-safety
const TABS = {
  PROFILE: "profile",
  SECURITY: "security",
  PREFERENCES: "preferences",
} as const;

/**
 * Settings Page
 * Manages user settings divided into tabs:
 * - Profile: Basic user metrics (First Name, Last Name, Email)
 * - Security: Password change
 * - Preferences: UI themes (Dark/Light mode)
 */
const SettingsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Derive active tab directly from URL (Single Source of Truth)
  const tabFromUrl = searchParams.get("tab");
  const validTabs = Object.values(TABS) as string[];
  const activeTab = validTabs.includes(tabFromUrl || "")
    ? tabFromUrl!
    : TABS.PROFILE;

  // Update URL on tab change (no local state needed)
  const handleTabChange = (value: string) => {
    navigate(`/settings?tab=${value}`, { replace: true });
  };

  if (!user) return null;

  return (
    <PageContent>
      <PageHeader
        title="Impostazioni"
        subtitle="Gestisci le impostazioni del tuo account e le preferenze."
      />

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/50">
          <TabsTrigger value={TABS.PROFILE} className="flex-1">
            <User className="h-4 w-4 mr-2" />
            Profilo
          </TabsTrigger>
          <TabsTrigger value={TABS.SECURITY} className="flex-1">
            <Shield className="h-4 w-4 mr-2" />
            Sicurezza
          </TabsTrigger>
          <TabsTrigger value={TABS.PREFERENCES} className="flex-1">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Preferenze
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {/* PROFILE TAB */}
          <TabsContent value={TABS.PROFILE} className="space-y-4">
            <ProfileSection />
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value={TABS.SECURITY} className="space-y-4">
            <SecuritySection />
          </TabsContent>

          {/* PREFERENCES TAB */}
          <TabsContent value={TABS.PREFERENCES} className="space-y-4">
            <PreferencesSection />
          </TabsContent>
        </div>
      </Tabs>
    </PageContent>
  );
};

export default SettingsPage;
