// Common API types for pagination and responses

export type TransactionResult<T> = {
  data: T[];
  count: number;
};

export type PaginationParams = {
  skip?: number;
  take?: number;
};
