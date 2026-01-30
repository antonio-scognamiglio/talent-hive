/**
 * Utility functions for application status visualization
 */

/**
 * Returns the color classes (Tailwind) for a given application status badge
 * @param status - The workflow status (NEW, SCREENING, etc.)
 * @returns Tailwind CSS classes string
 */
export const getApplicationStatusColor = (
  status: string | undefined,
): string => {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800";
    case "SCREENING":
      return "bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800";
    case "INTERVIEW":
      return "bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800";
    case "OFFER":
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
    case "HIRED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800";
    case "REJECTED":
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
  }
};

/**
 * Returns a human-readable label for the application status
 * @param status - The workflow status
 * @returns Localized label string
 */
export const getApplicationStatusLabel = (
  status: string | undefined,
): string => {
  switch (status) {
    case "NEW":
      return "Inviata";
    case "SCREENING":
      return "In revisione";
    case "INTERVIEW":
      return "Colloquio";
    case "OFFER":
      return "Offerta";
    case "HIRED":
      return "Assunto";
    case "REJECTED":
      return "Non selezionato";
    default:
      return "Sconosciuto";
  }
};

/**
 * Returns the status label tailored for the Candidate view.
 * Candidates should not see internal workflow steps, only the final decision
 * or a generic "In Progress" status.
 */
export const getCandidateDisplayStatus = (
  finalDecision: string | null | undefined,
): string => {
  if (!finalDecision) return "In valutazione";
  if (finalDecision === "HIRED") return "Assunto";
  if (finalDecision === "REJECTED") return "Non selezionato";
  return "In valutazione";
};

/**
 * Returns the color for the Candidate view status.
 */
export const getCandidateStatusColor = (
  finalDecision: string | null | undefined,
): string => {
  // Se undefined/null -> In Valutazione (Blue/Neutral)
  if (!finalDecision) {
    return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-800";
  }

  if (finalDecision === "HIRED") {
    // Green / Emerald
    return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-200 dark:border-emerald-800";
  }

  if (finalDecision === "REJECTED") {
    // Red / Destructive
    return "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/50 dark:text-red-200 dark:border-red-800";
  }

  // Fallback (non dovrebbe succedere se i tipi sono corretti)
  return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
};

/**
 * Returns the solid color class for the status indicator stripe.
 * deterministic mapping for "border-l-4" or standalone indicator divs.
 */
export const getCandidateIndicatorColor = (
  finalDecision: string | null | undefined,
): string => {
  if (!finalDecision) return "bg-blue-500"; // In valutazione
  if (finalDecision === "HIRED") return "bg-emerald-500"; // Assunto
  if (finalDecision === "REJECTED") return "bg-red-500"; // Non selezionato
  return "bg-gray-500"; // Fallback
};
