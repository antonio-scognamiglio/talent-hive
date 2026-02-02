import type { ColumnConfig } from "@/features/shared/types/table.types";
import type { JobWithCount } from "../types/job.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Trash } from "lucide-react";
import { formatDate } from "@/features/shared/utils/date.utils";
import { getJobStatusVariant, getJobStatusLabel } from "./job-status.utils";

interface CreateJobColumnsConfigOptions {
  /**
   * Callback per eliminare un job. Se non fornito, il bottone delete non viene mostrato.
   * View e Edit sono gestiti tramite onRowClick → JobDetailDialog.
   */
  onDelete?: (job: JobWithCount) => void;
}

/**
 * Factory function per creare la configurazione delle colonne della tabella Jobs.
 *
 * Pattern: "Inline Edit Modal"
 * - Click sulla riga → Apre JobDetailDialog (view/edit)
 * - Bottone Trash → Quick action per eliminare
 */
export function createJobColumnsConfig({
  onDelete,
}: CreateJobColumnsConfigOptions): ColumnConfig<JobWithCount>[] {
  // Helper per il badge status
  const getStatusBadge = (status: JobWithCount["status"]) => {
    const variantClasses = getJobStatusVariant(status);
    const label = getJobStatusLabel(status);
    return <Badge className={variantClasses}>{label}</Badge>;
  };

  const columns: ColumnConfig<JobWithCount>[] = [
    {
      key: "title",
      header: "Titolo",
      width: { default: 4 },
      cell: (job) => (
        <div className="flex flex-col gap-1">
          <span className="font-semibold text-foreground">{job.title}</span>
          <span className="text-xs text-muted-foreground line-clamp-1">
            {job.description}
          </span>
        </div>
      ),
    },
    {
      key: "location",
      header: "Sede",
      width: { default: 2 },
      field: "location",
    },
    {
      key: "status",
      header: "Stato",
      width: { default: 2 },
      cell: (job) => getStatusBadge(job.status),
    },
    {
      key: "applicationsCount",
      header: "Candidature",
      width: { default: 1 },
      align: "center",
      cell: (job) => {
        const count = (job as JobWithCount)._count?.applications ?? 0;
        return (
          <span className="text-muted-foreground font-medium">{count}</span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Creato il",
      width: { default: 2 },
      cell: (job) => (
        <span className="text-muted-foreground text-xs">
          {formatDate(job.createdAt)}
        </span>
      ),
    },
  ];

  // Aggiungi colonna azioni solo se onDelete è fornito
  if (onDelete) {
    columns.push({
      key: "actions",
      header: "",
      width: { default: 1 },
      align: "right",
      cell: (job) => (
        <div className="flex items-center justify-end gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-red-50 dark:hover:bg-red-950"
                  onClick={(e) => {
                    e.stopPropagation(); // Previene l'apertura del dialog
                    onDelete(job);
                  }}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Elimina</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    });
  }

  return columns;
}
