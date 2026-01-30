/**
 * ApplicationDetailModal
 *
 * Modale di dettaglio per una candidatura (vista candidato).
 * Mostra:
 * - Status finalDecision (unico visibile a candidati)
 * - Cover letter (se presente)
 * - CV view (via onViewCv callback)
 * - Link al job (nuova tab)
 */

import { useCallback } from "react";
import { CustomDialog } from "@/features/shared/components/CustomDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, FileText, Calendar, MapPin } from "lucide-react";
import type { Application } from "@shared/types";
import { formatDate } from "@/features/shared/utils/date.utils";
import {
  getCandidateDisplayStatus,
  getCandidateStatusColor,
} from "../utils/status.utils";

interface ApplicationDetailModalProps {
  application: Application;
  isOpen: boolean;
  onClose: () => void;
  /** Handler per visualizzare il CV - ricevuto da useMyApplications.handleViewCv */
  onViewCv: (applicationId: string) => Promise<void>;
}

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  isOpen,
  onClose,
  onViewCv,
}) => {
  const job = application.job;
  const statusLabel = getCandidateDisplayStatus(application.finalDecision);
  const statusColor = getCandidateStatusColor(application.finalDecision);

  // Handler per aprire il job in nuova tab
  const handleViewJob = useCallback(() => {
    if (job?.id) {
      window.open(`/jobs/${job.id}`, "_blank", "noopener,noreferrer");
    }
  }, [job]);

  // Handler per visualizzare il CV - usa callback passata dal parent
  const handleViewCv = useCallback(() => {
    onViewCv(application.id);
  }, [onViewCv, application.id]);

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={onClose}
      header={{
        title: job?.title || "Dettaglio Candidatura",
        description: (
          <div className="flex items-center gap-2 mt-1">
            <Badge className={statusColor} variant="outline">
              {statusLabel}
            </Badge>
            {job?.location && (
              <span className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {job.location}
              </span>
            )}
          </div>
        ),
      }}
      footer={{
        secondaryButton: {
          text: "Chiudi",
          onClick: onClose,
        },
      }}
    >
      <div className="h-full overflow-y-auto p-4 space-y-6">
        {/* Info candidatura */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1.5" />
            <span>Candidato il {formatDate(application.createdAt)}</span>
          </div>
        </div>

        <Separator />

        {/* Cover Letter */}
        {application.coverLetter && (
          <div className="space-y-2">
            <h4 className="font-semibold text-sm">Lettera di presentazione</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
              {application.coverLetter}
            </p>
          </div>
        )}

        {/* CV */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Curriculum Vitae</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewCv}
            className="flex items-center gap-2"
          >
            <FileText className="h-4 w-4" />
            Visualizza CV
          </Button>
        </div>

        <Separator />

        {/* Link al job */}
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">Annuncio di lavoro</h4>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewJob}
            disabled={!job?.id}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Vedi annuncio completo
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};
