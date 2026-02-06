import type { OrderByOption } from "@/features/shared/components";

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

export type WorkflowStatusFilterValue =
  | "all"
  | "NEW"
  | "SCREENING"
  | "INTERVIEW"
  | "OFFER"
  | "DONE";

export const WORKFLOW_STATUS_FILTER_OPTIONS: {
  label: string;
  value: WorkflowStatusFilterValue;
}[] = [
  { label: "Tutti gli stati", value: "all" },
  { label: "Nuova", value: "NEW" },
  { label: "Screening", value: "SCREENING" },
  { label: "Colloquio", value: "INTERVIEW" },
  { label: "Offerta", value: "OFFER" },
  { label: "Completata", value: "DONE" },
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
