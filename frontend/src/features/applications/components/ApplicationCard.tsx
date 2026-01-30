import { Calendar, MapPin, Eye } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { GhostButton } from "@/features/shared/components/GhostButton";
import type { Application } from "@shared/types";
import { formatDate } from "@/features/shared/utils/date.utils";
import {
  getCandidateDisplayStatus,
  getCandidateStatusColor,
  getCandidateIndicatorColor,
} from "../utils/status.utils";
import { cn } from "@/lib/utils";

interface ApplicationCardProps {
  application: Application;
  onClick: (application: Application) => void;
}

export const ApplicationCard = ({
  application,
  onClick,
}: ApplicationCardProps) => {
  const job = application.job;
  const statusLabel = getCandidateDisplayStatus(application.finalDecision);
  const statusColor = getCandidateStatusColor(application.finalDecision);
  const indicatorColor = getCandidateIndicatorColor(application.finalDecision);

  return (
    <Card
      className={cn(
        "h-full transition-all duration-200 cursor-pointer flex flex-col group",
        "hover:shadow-md hover:border-primary/50 relative overflow-hidden",
      )}
      onClick={() => onClick(application)}
    >
      {/* Status Stripe */}
      <div
        className={cn("absolute left-0 top-0 bottom-0 w-1", indicatorColor)}
      />

      <CardHeader className="pb-3 space-y-2 pl-5">
        <div className="flex justify-between items-start gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
              {job?.title || "Posizione sconosciuta"}
            </h3>
            {job?.location && (
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {job.location}
              </div>
            )}
          </div>
          <Badge className={statusColor} variant="outline">
            {statusLabel}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end pt-0 pl-5">
        <div className="flex items-center justify-between mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            <span>Candidato il {formatDate(application.createdAt)}</span>
          </div>

          <GhostButton
            text="Dettagli"
            icon={<Eye className="h-3.5 w-3.5" />}
            className="h-8 hover:text-primary"
            onClick={() => onClick(application)}
          />
        </div>
      </CardContent>
    </Card>
  );
};
