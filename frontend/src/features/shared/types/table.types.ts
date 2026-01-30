export type Fraction =
  | 0.5
  | 1
  | 1.5
  | 2
  | 2.5
  | 3
  | 3.5
  | 4
  | 4.5
  | 5
  | 5.5
  | 6
  | 6.5
  | 7
  | 7.5
  | 8
  | 8.5
  | 9
  | 9.5
  | 10
  | 10.5
  | 11
  | 11.5
  | 12;
export type ColumnWidth = {
  default?: Fraction;
  sm?: Fraction;
  md?: Fraction;
  lg?: Fraction;
  xl?: Fraction;
  "2xl"?: Fraction;
};

export type ColumnAlign = "left" | "center" | "right";

export type OrderBy = "asc" | "desc" | undefined;

export interface SortConfig {
  sortOrder: OrderBy;
  onSort: (currentOrder: OrderBy) => void;
}

export interface ColumnConfig<T> {
  key: string;
  header: React.ReactNode;
  field?: string;
  nullableField?: boolean;
  nullableFieldMessage?: string;
  width: ColumnWidth;
  align?: ColumnAlign;
  cell?: (item: T, index: number) => React.ReactNode;
  /** Classi CSS applicate a questa colonna specifica (sia header che body). Ha priorità sulle classi globali definite in slotProps */
  className?: string;
  hideHeader?: boolean;
  sortConfig?: SortConfig;
}
