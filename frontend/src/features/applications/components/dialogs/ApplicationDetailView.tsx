import { format } from "date-fns";
import { MapPin, FileText, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { Application } from "@shared/types";
import {
  getApplicationStatusLabel,
  getFinalDecisionStatusColor,
  getFinalDecisionStatusLabel,
  getWorkflowStatusColor,
} from "../../utils/status.utils";

interface ApplicationDetailViewProps {
  application: Application;
  onViewCv: (id: string) => Promise<void>;
}

export const ApplicationDetailView = ({
  application,
  onViewCv,
}: ApplicationDetailViewProps) => {
  return (
    <div className="h-full overflow-y-auto p-6 space-y-6">
      {/* Candidate Info Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Candidato
              </h3>
              <p className="text-lg font-medium">
                {application.user?.firstName} {application.user?.lastName}
              </p>
              <p className="text-sm text-muted-foreground">
                {application.user?.email}
              </p>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-semibold text-muted-foreground mb-1">
                Candidato il
              </h3>
              <p className="text-sm flex items-center justify-end gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(application.createdAt), "dd/MM/yyyy")}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Posizione
            </h3>
            <p className="font-medium">{application.job?.title}</p>
            {application.job?.location && (
              <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3" />
                {application.job.location}
              </p>
            )}
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              CV
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewCv(application.id)}
            >
              <FileText className="h-4 w-4 mr-2" />
              Visualizza CV
            </Button>
          </div>

          {application.coverLetter && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Lettera di Presentazione
                </h3>
                <p className="text-sm whitespace-pre-wrap bg-muted/30 p-3 rounded-md">
                  {application.coverLetter}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Workflow Status Card */}
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-muted-foreground mb-2">
              Status Candidatura
            </h3>
            <div className="flex items-center gap-2">
              <Badge
                className={getWorkflowStatusColor(application.workflowStatus)}
              >
                {getApplicationStatusLabel(
                  application.workflowStatus,
                  application.user?.role,
                )}
              </Badge>
              {application.finalDecision && (
                <Badge
                  className={getFinalDecisionStatusColor(
                    application.finalDecision,
                  )}
                >
                  {getFinalDecisionStatusLabel(application.finalDecision)}
                </Badge>
              )}
            </div>
          </div>

          {application.score && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Valutazione
                </h3>
                <p className="text-amber-500 font-medium">
                  {"⭐".repeat(application.score)}
                  <span className="text-muted-foreground text-sm ml-2 font-normal">
                    ({application.score}/5)
                  </span>
                </p>
              </div>
            </>
          )}

          {application.notes && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground mb-2">
                  Note
                </h3>
                <p className="text-sm whitespace-pre-wrap">
                  {application.notes}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
