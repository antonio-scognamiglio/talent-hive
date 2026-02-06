import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/shared/utils/date.utils";
import type { Application } from "@shared/types";
import type { ColumnConfig } from "@/features/shared/types/table.types";
import {
  getApplicationStatusLabel,
  getFinalDecisionStatusColor,
  getFinalDecisionStatusLabel,
  getWorkflowStatusColor,
} from "./status.utils";

/**
 * Factory function to create application table columns configuration.
 * Centralizes column definitions for consistency and reusability.
 */
export const createApplicationColumnsConfig =
  (): ColumnConfig<Application>[] => {
    return [
      {
        header: "Candidato",
        key: "user",
        width: { default: 4 },
        cell: (app) => (
          <div>
            <div className="font-medium">
              {app.user?.firstName} {app.user?.lastName}
            </div>
            <div className="text-xs text-muted-foreground">
              {app.user?.email}
            </div>
          </div>
        ),
      },
      {
        header: "Posizione",
        key: "job",
        width: { default: 3 },
        cell: (app) => app.job?.title || "-",
      },
      {
        header: "Status",
        key: "workflowStatus",
        width: { default: 3 },
        cell: (app) => (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getWorkflowStatusColor(app.workflowStatus)}>
              {getApplicationStatusLabel(app.workflowStatus)}
            </Badge>
            {app.finalDecision && (
              <Badge className={getFinalDecisionStatusColor(app.finalDecision)}>
                {getFinalDecisionStatusLabel(app.finalDecision)}
              </Badge>
            )}
          </div>
        ),
      },
      {
        header: "Rating",
        key: "score",
        width: { default: 1 },
        align: "center",
        cell: (app) =>
          app.score ? (
            <span className="text-amber-500 font-medium">
              {"⭐".repeat(app.score)}
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        header: "Data",
        key: "createdAt",
        width: { default: 2 },
        cell: (app) => formatDate(app.createdAt, "dd/MM/yyyy"),
      },
    ];
  };
