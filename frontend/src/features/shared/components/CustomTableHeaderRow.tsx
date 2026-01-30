/**
 * CustomTableHeaderRow Component
 *
 * Componente riutilizzabile per renderizzare una riga di header di tabella
 * con lo stesso stile e allineamento delle colonne in CustomTable.
 * Gestisce sorting, sticky header, e accessibilità.
 */

import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import type { ColumnConfig } from "../types/table.types";
import {
  getColumnWidthClass,
  getColumnAlign,
} from "@/features/shared/utils/layout-utils";
import { ArrowUp, ArrowDown, ChevronsUpDown } from "lucide-react";

export interface CustomTableHeaderRowProps<T = unknown> {
  /** Configurazione delle colonne (stessa di CustomTable) */
  columns: ColumnConfig<T>[];
  /** Classi CSS per la riga header */
  rowClassName?: string;
  /** Padding orizzontale delle celle (default: 16) */
  cellXPadding?: number;
  /** Padding verticale delle celle (default: 16) */
  cellYPadding?: number;
  /** Classi CSS globali per tutte le celle header */
  headerCellClassName?: string;
  /** Header fisso durante lo scroll */
  sticky?: boolean;
  /** Wrapper TableHeader (se false, renderizza solo TableRow) */
  wrapInTableHeader?: boolean;
}

export function CustomTableHeaderRow<T = unknown>({
  columns,
  rowClassName,
  cellXPadding = 16,
  cellYPadding = 16,
  headerCellClassName,
  sticky = false,
  wrapInTableHeader = true,
}: CustomTableHeaderRowProps<T>) {
  const columnsWithClasses = columns.map((column) => ({
    nullableField: false,
    ...column,
    widthClass: getColumnWidthClass(column.width),
    alignClass: getColumnAlign(column.align),
  }));

  const headerRow = (
    <TableRow className={rowClassName}>
      {columnsWithClasses.map((column) => (
        <TableHead
          key={column.key}
          style={{ padding: `${cellYPadding}px ${cellXPadding}px` }}
          className={cn(
            column.widthClass,
            column.alignClass,
            "overflow-hidden",
            column.hideHeader && "sr-only",
            sticky && "sticky top-0 bg-background z-10",
            "text-muted-foreground",
            column.sortConfig && "cursor-pointer select-none hover:bg-muted",
            headerCellClassName,
            column.className,
          )}
          onClick={
            column.sortConfig
              ? () => column.sortConfig!.onSort(column.sortConfig!.sortOrder)
              : undefined
          }
          role={column.sortConfig ? "button" : undefined}
          aria-sort={
            column.sortConfig
              ? column.sortConfig.sortOrder === "asc"
                ? "ascending"
                : column.sortConfig.sortOrder === "desc"
                  ? "descending"
                  : "none"
              : undefined
          }
        >
          <div
            className={cn(
              "flex items-center space-x-1",
              column.align === "center" && "justify-center",
              column.align === "right" && "justify-end",
            )}
          >
            <span>{column.header}</span>
            {column.sortConfig && (
              <span className="flex items-center">
                {column.sortConfig.sortOrder === "asc" ? (
                  <ArrowUp className="h-4 w-4 text-blue-600" />
                ) : column.sortConfig.sortOrder === "desc" ? (
                  <ArrowDown className="h-4 w-4 text-blue-600" />
                ) : (
                  <ChevronsUpDown className="h-4 w-4 opacity-50" />
                )}
              </span>
            )}
          </div>
        </TableHead>
      ))}
    </TableRow>
  );

  if (wrapInTableHeader) {
    return <TableHeader>{headerRow}</TableHeader>;
  }

  return headerRow;
}
