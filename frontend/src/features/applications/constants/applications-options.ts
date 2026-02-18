import type { OrderByOption } from "@/features/shared/components";
import type { WorkflowStatus } from "@shared/types/entities/generated/interfaces";

export type FinalDecisionStatusFilterValue =
  | "all"
  | "pending"
  | "HIRED"
  | "REJECTED";

export const APPLICATION_STATUS_FILTER_OPTIONS: {
  label: string;
  value: FinalDecisionStatusFilterValue;
}[] = [
  { label: "Tutti gli stati", value: "all" },
  { label: "In attesa", value: "pending" },
  { label: "Assunto", value: "HIRED" },
  { label: "Rifiutato", value: "REJECTED" },
];

export type WorkflowStatusFilterValue = "all" | WorkflowStatus;

// Totale degli stati possibili (dal tipo generato)
// Definito come const tuple per compatibilità con Zod senza cast
export const ALL_WORKFLOW_STATUSES = [
  "NEW",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "DONE",
] as const;

import { getApplicationStatusLabel } from "../utils/status.utils";

export const WORKFLOW_STATUS_FILTER_OPTIONS: {
  label: string;
  value: WorkflowStatusFilterValue;
}[] = [
  { label: "Tutti gli stati", value: "all" },
  ...ALL_WORKFLOW_STATUSES.map((status) => ({
    label: getApplicationStatusLabel(status),
    value: status,
  })),
];

/**
 * Opzioni di ordinamento per le applications
 */
export const APPLICATION_ORDER_BY_OPTIONS: OrderByOption[] = [
  { label: "Nessun ordinamento", value: "none" },
  { label: "Più recenti", value: "createdAt-desc" },
  { label: "Meno recenti", value: "createdAt-asc" },
];

export const SCORE_OPTIONS = [
  { value: undefined, label: "Nessuna valutazione" },
  { value: 1, label: "⭐ 1" },
  { value: 2, label: "⭐⭐ 2" },
  { value: 3, label: "⭐⭐⭐ 3" },
  { value: 4, label: "⭐⭐⭐⭐ 4" },
  { value: 5, label: "⭐⭐⭐⭐⭐ 5" },
] as const;
