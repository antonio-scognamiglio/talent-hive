import "@/index.css";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useMemo } from "react";
import { Spinner } from "./Spinner";
import type { ColumnConfig } from "../types/table.types";
import {
  getBreakpointFractions,
  getColumnWidthClass,
  getColumnAlign,
} from "@/features/shared/utils/layout-utils";
import { getNestedValue } from "@/features/shared/utils/object.utils";
import { CustomTableRow } from "./CustomTableRow";
import { CustomTableHeaderRow } from "./CustomTableHeaderRow";

export interface CustomTableProps<T> {
  // === LOGICA ===
  data: T[];
  columns: ColumnConfig<T>[];
  onRowClick?: (item: T) => void;
  isLoading?: boolean;
  loadingType?: "skeleton" | "overlay";
  loadingRows?: number;
  emptyMessage?: string;
  emptyState?: React.ReactNode;
  errorMessage?: string;
  errorState?: React.ReactNode;
  isError?: boolean;
  autofill?: boolean;
  minRowsNumber?: number;
  /** Layout della tabella: "fixed" mantiene width fisse, "auto" permette espansione basata sul contenuto */
  tableLayout?: "auto" | "fixed";

  // === STILE ===
  slotProps?: {
    /** Stili per il TableRow dell'header (es: border-b per bordo sotto tutto l'header) */
    headerRow?: {
      /** Classi CSS applicate al TableRow dell'header, è un contenitore logico quindi classi come bg-red-400 non hanno effetto, utile per classi come border-b */
      className?: string;
    };
    /** Stili per le celle TableHead */
    headerCell?: {
      /** Classi CSS applicate a tutte le celle header */
      className?: string;
      /** Header fisso durante lo scroll. Richiede una height definita su container.className o su un parent wrapper esterno */
      sticky?: boolean;
    };
    /** Stili per le righe del body */
    row?: {
      className?: string;
    };
    /** Stili globali per tutte le celle del body */
    cell?: {
      xPadding?: number;
      yPadding?: number;
      /** Classi CSS applicate a tutte le celle del body */
      className?: string;
      showVerticalSeparator?: boolean;
      /** Mostra scrollbar sottile nelle celle quando necessario (default: true) */
      showCellScrollbar?: boolean;
    };
    /** Stili per il container della tabella */
    container?: {
      /** Classi CSS per il container (es: rounded, border). Per sticky header, includere una classe di altezza come "h-[70vh]" */
      className?: string;
      hideScrollbar?: boolean;
    };
  };
}

export function CustomTable<T>({
  data,
  columns,
  onRowClick,
  isLoading = false,
  loadingType = "skeleton",
  loadingRows = 24,
  emptyMessage = "Nessun dato disponibile",
  emptyState,
  autofill = false,
  minRowsNumber = 24,
  errorMessage = "Si è verificato un errore, prova a ricaricare la pagina",
  errorState,
  isError = false,
  tableLayout = "fixed",
  slotProps,
}: CustomTableProps<T>) {
  // Estrarre valori da slotProps con defaults
  const {
    headerRow: headerRowProps = {},
    headerCell: headerCellProps = {},
    row: rowProps = {},
    cell: cellProps = {},
    container: containerProps = {},
  } = slotProps || {};

  const { className: headerRowClassName } = headerRowProps;

  const { className: headerCellClassName, sticky: stickyHeader = false } =
    headerCellProps;

  const { className: rowClassName } = rowProps;

  const {
    xPadding: cellXPadding = 16,
    yPadding: cellYPadding = 16,
    className: cellClassName,
    showVerticalSeparator = false,
    showCellScrollbar = true,
  } = cellProps;

  const { className: containerClassName, hideScrollbar = false } =
    containerProps;
  const columnsWithClasses = useMemo(() => {
    return columns.map((column) => ({
      nullableField: false,
      ...column,
      widthClass: getColumnWidthClass(column.width),
      alignClass: getColumnAlign(column.align),
    }));
  }, [columns]);

  useMemo(() => {
    getBreakpointFractions(columns);
  }, [columns]);

  const skeletonRows = useMemo(() => {
    return Array.from({ length: loadingRows }).map((_, index) => (
      <TableRow key={`skeleton-${index}`} className="min-h-14">
        {columnsWithClasses.map((column) => (
          <TableCell
            key={`skeleton-${index}-${column.key}`}
            style={{ padding: `${cellYPadding}px ${cellXPadding}px` }}
            className={cn(
              column.widthClass,
              column.alignClass,
              "overflow-hidden",
            )}
          >
            <Skeleton className="h-6 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }, [columnsWithClasses, loadingRows, cellXPadding, cellYPadding]);

  const defaultEmptyMessage = useMemo(
    () => <span className="text-xl text-muted-foreground">{emptyMessage}</span>,
    [emptyMessage],
  );

  const defaultErrorMessage = useMemo(
    () => <span className="text-xl text-muted-foreground">{errorMessage}</span>,
    [errorMessage],
  );

  const filledRows = data.map((item, index) => (
    <CustomTableRow
      key={index}
      columns={columns}
      cellRenderer={(_column, columnIndex) => {
        const columnWithClasses = columnsWithClasses[columnIndex];
        return columnWithClasses.cell ? (
          columnWithClasses.cell(item, index)
        ) : columnWithClasses.field ? (
          (getNestedValue(item, columnWithClasses.field) ??
          (columnWithClasses.nullableField ? (
            <span className="text-muted-foreground italic">
              {columnWithClasses.nullableFieldMessage ?? ""}
            </span>
          ) : (
            <span className="text-muted-foreground italic">
              ⚠️ Nessun dato per il campo " {columnWithClasses.field} "
            </span>
          )))
        ) : (
          <span className="text-muted-foreground italic">
            ⚠️ Nessun renderer per la colonna " {columnWithClasses.key} " —
            aggiungi `field` o `cell`
          </span>
        );
      }}
      rowClassName={cn(
        onRowClick && "cursor-pointer hover:bg-muted/50",
        rowClassName,
      )}
      onClick={() => onRowClick?.(item)}
      cellXPadding={cellXPadding}
      cellYPadding={cellYPadding}
      cellClassName={cellClassName}
      showVerticalSeparator={showVerticalSeparator}
      tableLayout={tableLayout}
      showCellScrollbar={showCellScrollbar}
    />
  ));

  const emptyFillRows =
    autofill && minRowsNumber > data.length
      ? Array.from({ length: minRowsNumber - data.length }).map((_, idx) => (
          <CustomTableRow
            key={`fill-${idx}`}
            columns={columns}
            cellRenderer={() => null}
            rowClassName={rowClassName}
            cellXPadding={cellXPadding}
            cellYPadding={cellYPadding}
            cellClassName={cellClassName}
            showVerticalSeparator={showVerticalSeparator}
            tableLayout={tableLayout}
            showCellScrollbar={showCellScrollbar}
          />
        ))
      : null;

  return (
    <div
      className={cn("relative w-full overflow-auto h-full", containerClassName)}
      style={{
        scrollbarWidth: hideScrollbar ? "none" : "auto",
        msOverflowStyle: hideScrollbar ? "none" : "auto",
      }}
    >
      <table
        className={cn(
          "w-full caption-bottom text-sm",
          tableLayout === "auto" ? "table-auto" : "table-fixed",
        )}
      >
        <CustomTableHeaderRow
          columns={columns}
          rowClassName={headerRowClassName}
          cellXPadding={cellXPadding}
          cellYPadding={cellYPadding}
          headerCellClassName={headerCellClassName}
          sticky={stickyHeader}
          wrapInTableHeader={true}
        />
        <TableBody>
          {isLoading ? (
            loadingType === "skeleton" ? (
              skeletonRows
            ) : (
              <TableRow>
                <TableCell colSpan={columnsWithClasses.length} className="p-0">
                  <div className="inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center min-h-52">
                    <Spinner size="lg" variant="default" showMessage />
                  </div>
                </TableCell>
              </TableRow>
            )
          ) : isError ? (
            <TableRow>
              <TableCell colSpan={columnsWithClasses.length} className="p-0">
                <div className="flex items-center justify-center w-full min-h-52">
                  {errorState || defaultErrorMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columnsWithClasses.length} className="p-0">
                <div className="flex items-center justify-center w-full min-h-52">
                  {emptyState || defaultEmptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            <>{[...filledRows, ...(emptyFillRows ?? [])]}</>
          )}
        </TableBody>
      </table>
    </div>
  );
}
