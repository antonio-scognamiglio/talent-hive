import type { PropsWithChildren } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthCardProps {
  title: string;
  description?: string;
}

/**
 * AuthCard Component
 *
 * Wrapper card for auth forms with layout shift prevention.
 * Uses flexbox constraints to maintain consistent height when content changes.
 *
 * Key CSS patterns:
 * - `flex flex-col h-full`: Fixed height container
 * - `shrink-0` on header: Prevents header collapse
 * - `flex-1 min-h-0 overflow-hidden` on content: Allows shrinking, enables scroll
 * - `transition-all duration-300`: Smooth content changes
 */
export function AuthCard({
  title,
  description,
  children,
}: PropsWithChildren<AuthCardProps>) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="shrink-0">
        <CardTitle className="text-2xl text-center">{title}</CardTitle>
        {description && (
          <CardDescription className="text-center">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-1 min-h-0 overflow-hidden transition-all duration-300">
        {children}
      </CardContent>
    </Card>
  );
}
