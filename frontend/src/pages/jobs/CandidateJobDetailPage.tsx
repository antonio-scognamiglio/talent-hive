import { useParams, useNavigate } from "react-router-dom";
import { useJobWithApplicationStatus } from "@/features/jobs/hooks/useJobWithApplicationStatus";
import { PageContent } from "@/features/shared/components/layout/PageContent";
import { DetailPageHeader } from "@/features/shared/components/layout/DetailPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Banknote,
  Calendar,
  Clock,
  Briefcase,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import {
  getRelativeTimeString,
  formatDate,
} from "@/features/shared/utils/date.utils";
import { EmptyState } from "@/features/shared/components/EmptyState";
import { formatMoney } from "@/features/shared/utils/format.utils";
import { Spinner } from "@/features/shared/components/Spinner";
import {
  getCandidateDisplayStatus,
  getCandidateStatusColor,
} from "@/features/applications/utils/status.utils";
import { PrimaryButton } from "@/features/shared/components";

export default function CandidateJobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { job, isLoading, isError } = useJobWithApplicationStatus({
    jobId: id,
  });

  const handleApply = () => {
    // TODO: Implement Apply Dialog with CV upload
    console.log("Open apply dialog for job:", job?.id);
  };

  if (isLoading) {
    return (
      <PageContent>
        <Spinner size="lg" message="Caricamento dettagli..." showMessage />
      </PageContent>
    );
  }

  if (isError || !job) {
    return (
      <PageContent>
        <EmptyState
          icon={<Briefcase className="h-12 w-12 text-muted-foreground" />}
          title="Annuncio non trovato"
          description="L'annuncio che stai cercando non esiste o è stato rimosso."
          buttonText="Torna agli annunci"
          onButtonClick={() => navigate("/jobs")}
        />
      </PageContent>
    );
  }

  const isApplied = job.hasApplied;
  // Use the application object directly for status helpers
  const myApplication = job.myApplication;

  return (
    <PageContent>
      <DetailPageHeader
        title={job.title}
        subTitle={
          <div className="flex flex-wrap items-center gap-2 text-muted-foreground mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {job.location || "Remoto"}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Pubblicato {getRelativeTimeString(new Date(job.createdAt))}
            </span>
          </div>
        }
        backLabel="Torna agli annunci"
        onBack={() => navigate("/jobs")}
        rightAction={
          isApplied ? (
            <Badge
              variant="outline"
              className={`px-3 py-1.5 text-sm font-medium ${getCandidateStatusColor(
                myApplication?.finalDecision,
              )}`}
            >
              Status: {getCandidateDisplayStatus(myApplication?.finalDecision)}
            </Badge>
          ) : (
            <PrimaryButton onClick={handleApply} text="Invia Candidatura" />
          )
        }
      />

      <div className="grid gap-6 md:grid-cols-3 mt-8">
        {/* Main Content - Colonna Sinistra (2/3) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrizione</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none text-muted-foreground whitespace-pre-line">
                {job.description}
              </div>
            </CardContent>
          </Card>

          {/* Sezione Requisiti (Mock visivo se non strutturato) */}
          <Card>
            <CardHeader>
              <CardTitle>Cosa cerchiamo</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>Esperienza dimostrabile nel ruolo</span>
                </li>
                <li className="flex gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>Capacità di lavorare in team</span>
                </li>
                <li className="flex gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  <span>Problem solving e proattività</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Colonna Destra (1/3) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dettagli Offerta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Banknote className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Salario</div>
                  <div className="text-sm text-muted-foreground">
                    {job.salaryMin && job.salaryMax
                      ? `${formatMoney(job.salaryMin)} - ${formatMoney(
                          job.salaryMax,
                        )}`
                      : "Competitivo"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Sede</div>
                  <div className="text-sm text-muted-foreground">
                    {job.location || "Remoto / Ibrido"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="flex items-start gap-3">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-medium">Pubblicato il</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(new Date(job.createdAt), "d MMMM yyyy")}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Card per mobile o evidenza extra */}
          <div className="md:hidden">
            {isApplied ? (
              <div className="p-4 bg-muted/50 rounded-lg border flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <div className="font-medium">
                    Hai già inviato la candidatura
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Status attuale:{" "}
                    <span className="font-medium">
                      {getCandidateDisplayStatus(myApplication?.finalDecision)}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <Button className="w-full" size="lg" onClick={handleApply}>
                Invia Candidatura
              </Button>
            )}
          </div>

          {/* Info Card */}
          <Card className="bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900">
            <CardContent className="p-4 flex gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-1">Processo di selezione</p>
                Il processo include tipicamente un primo screening del CV, un
                colloquio tecnico e uno conoscitivo.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageContent>
  );
}
