import type {
  ColumnAlign,
  ColumnWidth,
  OrderBy,
} from "@/features/shared/types/table.types";

// Helper per ottenere le classi CSS per le dimensioni delle colonne
export function getColumnWidthClass(width: ColumnWidth): string {
  const breakpoints: (keyof ColumnWidth)[] = [
    "default",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
  ];

  return breakpoints
    .map((bp) => {
      const val = width[bp];
      if (!val || val < 0.5 || val > 12) return "";

      const prefix = bp === "default" ? "" : `${bp}:`;
      const classNameValue = val.toString().replace(".", "");
      return `${prefix}tl-w-${classNameValue}`;
    })
    .filter(Boolean)
    .join(" ");
}

// Helper per validare le dimensioni delle colonne
export function getBreakpointFractions(columns: { width: ColumnWidth }[]) {
  const breakpoints: (keyof ColumnWidth)[] = [
    "default",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
  ];
  const result: Record<string, number> = {};

  for (const bp of breakpoints) {
    let sum = 0;

    for (const col of columns) {
      const width = col.width[bp] ?? col.width.default;
      if (width) sum += width;
    }

    if (sum > 12) {
      console.warn(
        `⚠️ Somma width @${bp} = ${sum} (> 12). Potrebbero esserci problemi di layout.`,
      );
    }

    result[bp] = sum;
  }

  return result;
}

// Funzione specifica per i filtri che usa col-span
export function getFilterColumnWidthClass(width: ColumnWidth): string {
  const breakpoints: (keyof ColumnWidth)[] = [
    "default",
    "sm",
    "md",
    "lg",
    "xl",
    "2xl",
  ];

  return breakpoints
    .map((bp) => {
      const val = width[bp];
      if (!val || val < 0.5 || val > 12) return "";

      const prefix = bp === "default" ? "" : `${bp}:`;
      const classNameValue = val.toString().replace(".", "");
      return `${prefix}tl-col-span-${classNameValue}`;
    })
    .filter(Boolean)
    .join(" ");
}

export function getColumnAlign(align?: ColumnAlign): string {
  switch (align) {
    case "left":
      return "text-left";
    case "center":
      return "text-center";
    case "right":
      return "text-right";
    default:
      return "text-left";
  }
}

// Funzione per ciclare tra i valori di ordinamento
export const getOrderBy = (order: OrderBy): OrderBy => {
  switch (order) {
    case undefined:
      return "asc";
    case "asc":
      return "desc";
    case "desc":
      return undefined;
  }
};
