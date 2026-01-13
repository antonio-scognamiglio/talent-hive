import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { AuthCard } from "@/features/auth/components/AuthCard";

type TabValue = "login" | "register";

/**
 * Auth Page
 * Unified authentication page with Login/Register tabs.
 * Uses lex-nexus pattern: full-screen flex layout with fixed header/footer,
 * forcing the auth card to take all remaining space regardless of content.
 */
export default function Auth() {
  const [activeTab, setActiveTab] = useState<TabValue>("login");

  return (
    <div className="h-full w-full bg-gradient-hero flex flex-col items-center section-padding overflow-auto">
      <div className="w-full max-w-md px-4 animate-fade-in flex flex-col justify-center gap-8 min-h-full py-12">
        {/* Card wrapper */}
        <AuthCard title="Benvenuto in TalentHive">
          <Tabs
            value={activeTab}
            onValueChange={(v) => setActiveTab(v as TabValue)}
            className="w-full h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 shrink-0">
              <TabsTrigger value="login">Accedi</TabsTrigger>
              <TabsTrigger value="register">Registrati</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="flex-1 min-h-0">
              <LoginForm />
            </TabsContent>

            <TabsContent value="register" className="flex-1 min-h-0">
              <RegisterForm onSuccess={() => setActiveTab("login")} />
            </TabsContent>
          </Tabs>
        </AuthCard>
      </div>
    </div>
  );
}
