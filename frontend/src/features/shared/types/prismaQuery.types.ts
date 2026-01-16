// Operatori comparativi generici
type ComparableOperators<T> = {
  equals?: T;
  in?: T[];
  notIn?: T[];
  lt?: T;
  lte?: T;
  gt?: T;
  gte?: T;
  not?: T | ComparableOperators<T>;
};

// Operatori per stringhe
type StringOperators = ComparableOperators<string> & {
  contains?: string;
  startsWith?: string;
  endsWith?: string;
  mode?: "default" | "insensitive";
};

// Operatori per relazioni nullable (is/isNot)
type RelationOperators = {
  is?: null;
  isNot?: null;
};

// Costruisce i filtri per ciascun campo in base al tipo
type FilterField<T> = T extends string
  ? string | StringOperators
  : T extends number | Date
  ? T | ComparableOperators<T>
  : T extends boolean
  ? T | { not?: T }
  : T extends object | null
  ? { [K in keyof T]?: FilterField<T[K]> } | RelationOperators
  : T;

// Tipi scalari ordinabili
type Scalar = string | number | boolean | Date | null;

// Solo le chiavi che sono scalari (per OrderBy)
type OrderableKeys<T> = {
  [K in keyof T]: T[K] extends Scalar ? K : never;
}[keyof T];

export type PrismaWhere<T> = {
  [K in keyof T]?: FilterField<T[K]>;
} & {
  AND?: PrismaWhere<T> | PrismaWhere<T>[];
  OR?: PrismaWhere<T>[];
  NOT?: PrismaWhere<T> | PrismaWhere<T>[];
};

export type PrismaOrderBy<T> =
  | Partial<Record<OrderableKeys<T>, "asc" | "desc">>
  | Array<Partial<Record<OrderableKeys<T>, "asc" | "desc">>>;

export type PrismaSelect<T> = {
  [K in keyof T]?:
    | true
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | (T[K] extends Array<any>
        ? never
        : T[K] extends object
        ? PrismaSelect<T[K]>
        : never);
};

export type PrismaInclude<T> =
  | {
      [K in keyof T]?: T[K] extends Array<infer R>
        ? PrismaInclude<R> | boolean
        : T[K] extends object
        ? PrismaInclude<T[K]> | boolean
        : never;
    }
  | {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [K: string]: boolean | PrismaInclude<any>;
    };

export type PrismaTake = number;
export type PrismaSkip = number;
export type PrismaCursor<T> = Partial<T>;
export type PrismaDistinct<T> = (keyof T)[];

/**
 * Prisma query options type
 * Used for consistent querying across frontend
 * (Backend uses native Prisma types directly)
 */
export type PrismaQueryOptions<T> = {
  where?: PrismaWhere<T>;
  orderBy?: PrismaOrderBy<T>;
  select?: PrismaSelect<T>;
  include?: PrismaInclude<T>;
  take?: PrismaTake;
  skip?: PrismaSkip;
  cursor?: PrismaCursor<T>;
  distinct?: PrismaDistinct<T>;
};

export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string | string | null | undefined ? K : never;
}[keyof T];

export type DateKeys<T> = {
  [K in keyof T]: T[K] extends Date | Date | null | undefined ? K : never;
}[keyof T];

export type WithCount<T> = T & {
  _count: {
    [K in keyof T]?: number;
  };
};
