/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Tipi condivisi per le funzioni API
 */

/**
 * Tipo generico per le funzioni API che accettano un body e opzionalmente un path nelle options.
 * Utilizzato da usePaginationForGen e useSearch per standardizzare
 * l'interfaccia delle funzioni API.
 */
export type ApiFunctionForGen<TResponse, TBody = any, TPath = any> = (options: {
  body: TBody;
  path: TPath;
  [key: string]: any;
}) => Promise<TResponse>;
