/**
 * CustomTableRow Component
 *
 * Componente riutilizzabile per renderizzare una singola riga di tabella
 * con lo stesso stile e allineamento delle righe in CustomTable.
 * Utile per righe totali, footer, o righe custom che devono allinearsi
 * perfettamente con le colonne della tabella principale.
 */

import { TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "../types/table.types";
import {
  getColumnWidthClass,
  getColumnAlign,
} from "@/features/shared/utils/layout-utils";

export interface CustomTableRowProps<T = unknown> {
  /** Configurazione delle colonne (stessa di CustomTable) */
  columns: ColumnConfig<T>[];
  /** Funzione per renderizzare il contenuto di ogni cella */
  cellRenderer: (
    column: ColumnConfig<T>,
    columnIndex: number,
  ) => React.ReactNode;
  /** Classi CSS per la riga */
  rowClassName?: string;
  /** Padding orizzontale delle celle (default: 16) */
  cellXPadding?: number;
  /** Padding verticale delle celle (default: 16) */
  cellYPadding?: number;
  /** Classi CSS globali per tutte le celle */
  cellClassName?: string;
  /** Mostra separatori verticali tra le colonne */
  showVerticalSeparator?: boolean;
  /** Callback quando la riga viene cliccata */
  onClick?: () => void;
  /** Layout della tabella: "fixed" mantiene width fisse, "auto" permette espansione basata sul contenuto */
  tableLayout?: "auto" | "fixed";
  /** Mostra scrollbar sottile nelle celle quando necessario (default: true) */
  showCellScrollbar?: boolean;
}

export function CustomTableRow<T = unknown>({
  columns,
  cellRenderer,
  rowClassName,
  cellXPadding = 16,
  cellYPadding = 16,
  cellClassName,
  showVerticalSeparator = false,
  onClick,
  tableLayout = "fixed",
  showCellScrollbar = true,
}: CustomTableRowProps<T>) {
  const columnsWithClasses = columns.map((column) => ({
    nullableField: false,
    ...column,
    widthClass: getColumnWidthClass(column.width),
    alignClass: getColumnAlign(column.align),
  }));

  return (
    <TableRow className={cn("min-h-14", rowClassName)} onClick={onClick}>
      {columnsWithClasses.map((column, columnIndex) => (
        <TableCell
          key={column.key}
          style={{ padding: `${cellYPadding}px ${cellXPadding}px` }}
          className={cn(
            column.widthClass,
            column.alignClass,
            "overflow-hidden",
            showVerticalSeparator &&
              columnIndex > 0 && [
                "relative before:content-[''] before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-8 before:w-px before:bg-border",
                "pl-6",
              ],
            cellClassName,
            column.className,
          )}
        >
          <div
            className={cn(
              "w-full min-w-0",
              tableLayout === "fixed"
                ? showCellScrollbar
                  ? "overflow-x-auto overflow-y-hidden [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent"
                  : "overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                : "overflow-hidden",
            )}
          >
            {cellRenderer(column, columnIndex)}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
}
