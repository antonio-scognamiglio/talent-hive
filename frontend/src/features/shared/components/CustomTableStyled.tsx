import { CustomTable, type CustomTableProps } from "./CustomTable";

type CustomTableStyledProps<T> = Omit<
  CustomTableProps<T>,
  "slotProps" | "loadingType"
>;

export function CustomTableStyled<T>(props: CustomTableStyledProps<T>) {
  return (
    <CustomTable
      {...props}
      tableLayout="auto"
      loadingType="overlay"
      slotProps={{
        headerCell: {
          sticky: true,
          className: "bg-card",
        },
        headerRow: {
          className: "hover:bg-muted",
        },
        // container: { className: "max-h-[70vh]" },
      }}
    />
  );
}
