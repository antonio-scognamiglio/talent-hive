/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  PrismaQueryOptions,
  PrismaWhere,
} from "../types/prismaQuery.types";

// Tipo per gli operatori di campo supportati
type FieldOperator =
  | "equals"
  | "in"
  | "notIn"
  | "contains"
  | "startsWith"
  | "endsWith"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

/**
 * Pulisce un filtro nella sezione where di una query Prisma
 * @param operator - Operatore opzionale per filtri di campo (default: 'equals')
 */
function cleanWhereFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: any,
  operator?: FieldOperator,
  mode: "merge" | "replace" = "merge",
): PrismaQueryOptions<T> | undefined {
  const newQuery = { ...prismaQuery };

  if (
    value === "all" ||
    value === undefined ||
    value === null ||
    value === ""
  ) {
    // Rimuovi il filtro (comportamento uguale per merge/replace quando il valore è vuoto)
    if (newQuery.where) {
      const currentFieldValue = (newQuery.where as any)[filterKey];

      if (
        operator &&
        operator !== "equals" &&
        typeof currentFieldValue === "object" &&
        currentFieldValue !== null &&
        mode !== "replace" // In replace mode, rimuoviamo tutto comunque se value è vuoto? Sì, o reset totale.
      ) {
        // MERGE: Rimuovi solo l'operatore specifico
        const { [operator]: _, ...restOperators } = currentFieldValue;

        if (Object.keys(restOperators).length === 0) {
          // Se non ci sono altri operatori, rimuovi tutto il campo
          const { [filterKey]: _, ...restWhere } = newQuery.where as any;
          newQuery.where =
            Object.keys(restWhere).length > 0 ? restWhere : undefined;
        } else {
          // Mantieni gli altri operatori
          newQuery.where = {
            ...newQuery.where,
            [filterKey]: restOperators,
          } as PrismaWhere<T>;
        }
      } else {
        // REPLACE o Default remove: rimuovi tutto il campo
        const { [filterKey]: _, ...restWhere } = newQuery.where as any;
        newQuery.where =
          Object.keys(restWhere).length > 0 ? restWhere : undefined;
      }
    }
  } else {
    // Aggiungi/aggiorna il filtro
    let filterValue: any = value;

    if (operator && operator !== "equals") {
      if (mode === "replace") {
        // REPLACE: Crea nuovo oggetto solo con questo operatore, ignorando quelli esistenti
        filterValue = { [operator]: value };
      } else {
        // MERGE (default): Mantieni operatori esistenti
        const currentFieldValue = (newQuery.where as any)?.[filterKey];

        if (
          typeof currentFieldValue === "object" &&
          currentFieldValue !== null
        ) {
          // Mantieni gli operatori esistenti e aggiungi/aggiorna quello nuovo
          filterValue = {
            ...currentFieldValue,
            [operator]: value,
          };
        } else {
          // Crea nuovo oggetto con l'operatore
          filterValue = { [operator]: value };
        }
      }
    }

    newQuery.where = {
      ...newQuery.where,
      [filterKey]: filterValue,
    } as PrismaWhere<T>;
  }

  return newQuery;
}

/**
 * Pulisce un filtro nella sezione orderBy di una query Prisma
 */
function cleanOrderByFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: any,
  mode: "merge" | "replace" = "merge",
): PrismaQueryOptions<T> | undefined {
  const newQuery = { ...prismaQuery };

  if (
    value === "all" ||
    value === undefined ||
    value === null ||
    value === ""
  ) {
    // Rimuovi il filtro
    if (newQuery.orderBy) {
      if (Array.isArray(newQuery.orderBy)) {
        // Gestione ordinamento multiplo - rimuovi il campo dall'array
        const filteredOrderBy = newQuery.orderBy
          .map((orderItem) => {
            const { [filterKey]: _, ...rest } = orderItem as any;
            return Object.keys(rest).length > 0 ? rest : null;
          })
          .filter(Boolean);

        newQuery.orderBy =
          filteredOrderBy.length > 0 ? filteredOrderBy : undefined;
      } else {
        // Gestione ordinamento singolo (oggetto)
        const { [filterKey]: _, ...restOrderBy } = newQuery.orderBy as any;
        newQuery.orderBy =
          Object.keys(restOrderBy).length > 0 ? restOrderBy : undefined;
      }
    }
  } else {
    // Aggiungi/aggiorna il filtro
    if (mode === "replace") {
      // REPLACE: Sostituisci completamente l'ordinamento
      newQuery.orderBy = [{ [filterKey]: value } as any];
    } else {
      // MERGE (default): Aggiungi o aggiorna
      if (Array.isArray(newQuery.orderBy)) {
        // Gestione ordinamento multiplo
        const existingIndex = newQuery.orderBy.findIndex(
          (orderItem) => (orderItem as any)[filterKey] !== undefined,
        );

        if (existingIndex >= 0) {
          // Aggiorna l'elemento esistente
          newQuery.orderBy[existingIndex] = {
            ...newQuery.orderBy[existingIndex],
            [filterKey]: value,
          };
        } else {
          // Aggiungi un nuovo elemento
          newQuery.orderBy.push({ [filterKey]: value } as any);
        }
      } else {
        // Se non è un array, converti in array con l'ordinamento esistente e il nuovo
        const existingOrderBy = newQuery.orderBy ? [newQuery.orderBy] : [];
        newQuery.orderBy = [...existingOrderBy, { [filterKey]: value } as any];
      }
    }
  }

  return newQuery;
}

/**
 * Aggiorna un filtro in una query Prisma, gestendo automaticamente la rimozione
 * quando il valore è "all", undefined, null o stringa vuota.
 *
 * @param prismaQuery - La query Prisma corrente
 * @param filterKey - La chiave del filtro da aggiornare
 * @param value - Il nuovo valore del filtro
 * @param section - La sezione della query ('where' o 'orderBy')
 * @param operator - Operatore opzionale per filtri di campo (solo per sezione 'where')
 * @returns La query aggiornata
 */
export function cleanPrismaQuery<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: any,
  section: "where" | "orderBy" = "where",
  operator?: FieldOperator,
  mode: "merge" | "replace" = "merge",
): PrismaQueryOptions<T> | undefined {
  if (section === "where") {
    return cleanWhereFilter(prismaQuery, filterKey, value, operator, mode);
  } else if (section === "orderBy") {
    return cleanOrderByFilter(prismaQuery, filterKey, value, mode);
  }

  return prismaQuery;
}

/**
 * Aggiorna più filtri contemporaneamente in una query Prisma.
 *
 * @param prismaQuery - La query Prisma corrente
 * @param filters - Array di oggetti con { key, value, section?, operator? }
 * @returns La query aggiornata
 */
export function cleanPrismaQueryMultiple<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filters: Array<{
    key: keyof T;
    value: any;
    section?: "where" | "orderBy";
    operator?: FieldOperator;
  }>,
): PrismaQueryOptions<T> | undefined {
  let result = prismaQuery || {};

  // Raggruppa i filtri per sezione
  const whereFilters = filters.filter((f) => f.section !== "orderBy");
  const orderByFilters = filters.filter((f) => f.section === "orderBy");

  // Applica i filtri where con operatori opzionali
  whereFilters.forEach(({ key, value, operator }) => {
    result = cleanPrismaQuery(result, key, value, "where", operator) || {};
  });

  // Per gli ordinamenti, se ci sono più di uno, gestiscili come array
  if (orderByFilters.length > 0) {
    if (orderByFilters.length === 1) {
      // Un solo ordinamento, applica normalmente
      result =
        cleanPrismaQuery(
          result,
          orderByFilters[0].key,
          orderByFilters[0].value,
          "orderBy",
        ) || {};
    } else {
      // Più ordinamenti, crea un array
      const orderByArray = orderByFilters
        .filter(
          (f) =>
            f.value !== undefined &&
            f.value !== null &&
            f.value !== "all" &&
            f.value !== "",
        )
        .map((f) => ({ [f.key]: f.value }));

      if (orderByArray.length > 0) {
        result.orderBy = orderByArray as any;
      } else {
        result.orderBy = undefined;
      }
    }
  }

  return result;
}

/**
 * Helper per controllare se una condizione contiene una chiave nested
 */
function conditionContainsNestedKey(
  condition: any,
  nestedKey: string,
): boolean {
  const keys = nestedKey.split(".");
  let current = condition;

  for (const key of keys) {
    if (!current || typeof current !== "object" || !(key in current)) {
      return false;
    }
    current = current[key];
  }

  return true;
}

/**
 * Gestisce specificamente l'array OR in una query Prisma.
 * Rimuove chiavi specifiche dall'OR esistente, preservando tutto il resto.
 * Supporta automaticamente chiavi nested (es. "customer.firstName").
 *
 * @param prismaQuery - La query Prisma corrente
 * @param keysToRemove - Array di chiavi da rimuovere dall'OR (supporta chiavi nested)
 * @returns La query aggiornata
 */
export function cleanORKeys<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  keysToRemove: string[],
): PrismaQueryOptions<T> | undefined {
  if (!prismaQuery?.where?.OR || !Array.isArray(prismaQuery.where.OR)) {
    return prismaQuery;
  }

  const filteredOR = prismaQuery.where.OR.filter((condition) => {
    // Controlla se la condizione contiene direttamente una delle chiavi da rimuovere
    const hasDirectKey = keysToRemove.some((key) => {
      if (key.includes(".")) {
        // Chiave nested
        return conditionContainsNestedKey(condition, key);
      } else {
        // Chiave normale
        return (condition as any)[key];
      }
    });

    if (hasDirectKey) {
      return false; // Rimuovi questa condizione
    }

    // Controlla se la condizione è una struttura AND/OR che contiene le chiavi
    if ((condition as any).AND && Array.isArray((condition as any).AND)) {
      // Se è una struttura AND, controlla se contiene le chiavi
      const andConditions = (condition as any).AND;
      const hasKeyInAND = andConditions.some((andCondition: any) => {
        if (andCondition.OR && Array.isArray(andCondition.OR)) {
          return andCondition.OR.some((orCondition: any) =>
            keysToRemove.some((key) => {
              if (key.includes(".")) {
                return conditionContainsNestedKey(orCondition, key);
              } else {
                return (orCondition as any)[key];
              }
            }),
          );
        }
        return keysToRemove.some((key) => {
          if (key.includes(".")) {
            return conditionContainsNestedKey(andCondition, key);
          } else {
            return (andCondition as any)[key];
          }
        });
      });

      if (hasKeyInAND) {
        return false; // Rimuovi questa condizione
      }
    }

    return true; // Mantieni questa condizione
  });

  return {
    ...prismaQuery,
    where: {
      ...prismaQuery.where,
      OR: filteredOR.length > 0 ? filteredOR : undefined,
    },
  };
}

/**
 * Aggiunge condizioni specifiche all'OR, rimuovendo prima le chiavi esistenti.
 *
 * @param prismaQuery - La query Prisma corrente
 * @param newConditions - Nuove condizioni da aggiungere
 * @param keysToReplace - Chiavi da sostituire (vengono rimosse prima)
 * @returns La query aggiornata
 */
export function updateORConditions<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  newConditions: any[],
  keysToReplace: string[],
): PrismaQueryOptions<T> | undefined {
  // Prima rimuovi le chiavi esistenti
  let result = cleanORKeys(prismaQuery, keysToReplace);

  // Poi aggiungi le nuove condizioni
  if (newConditions && newConditions.length > 0) {
    result = {
      ...result,
      where: {
        ...result?.where,
        OR: [...(result?.where?.OR || []), ...newConditions],
      } as PrismaWhere<T>,
    };
  }

  return result;
}

// Funzioni di convenienza per operatori comuni
/**
 * Aggiunge un filtro con operatore 'in' per array di valori
 */
export function addInFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  values: any[],
): PrismaQueryOptions<T> | undefined {
  return cleanPrismaQuery(prismaQuery, filterKey, values, "where", "in");
}

/**
 * Aggiunge un filtro con operatore 'notIn' per escludere valori
 */
export function addNotInFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  values: any[],
): PrismaQueryOptions<T> | undefined {
  return cleanPrismaQuery(prismaQuery, filterKey, values, "where", "notIn");
}

/**
 * Aggiunge un filtro con operatore 'contains' per ricerca testuale
 */
export function addContainsFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: string,
  caseSensitive: boolean = false,
): PrismaQueryOptions<T> | undefined {
  const filterValue = caseSensitive
    ? { contains: value }
    : { contains: value, mode: "insensitive" };

  return {
    ...prismaQuery,
    where: {
      ...prismaQuery?.where,
      [filterKey]: filterValue,
    } as PrismaWhere<T>,
  };
}

/**
 * Aggiunge un filtro con operatore 'startsWith' per ricerca testuale
 */
export function addStartsWithFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: string,
  caseSensitive: boolean = false,
): PrismaQueryOptions<T> | undefined {
  const filterValue = caseSensitive
    ? { startsWith: value }
    : { startsWith: value, mode: "insensitive" };

  return {
    ...prismaQuery,
    where: {
      ...prismaQuery?.where,
      [filterKey]: filterValue,
    } as PrismaWhere<T>,
  };
}

/**
 * Aggiunge un filtro con operatore 'endsWith' per ricerca testuale
 */
export function addEndsWithFilter<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  filterKey: keyof T,
  value: string,
  caseSensitive: boolean = false,
): PrismaQueryOptions<T> | undefined {
  const filterValue = caseSensitive
    ? { endsWith: value }
    : { endsWith: value, mode: "insensitive" };

  return {
    ...prismaQuery,
    where: {
      ...prismaQuery?.where,
      [filterKey]: filterValue,
    } as PrismaWhere<T>,
  };
}

/**
 * Crea condizioni OR per ricerca testuale, gestendo automaticamente chiavi normali e nested
 *
 * @param searchKeys - Array di chiavi da cercare (es. ["firstName", "customer.firstName"])
 * @param searchText - Testo da cercare
 * @param operator - Operatore di ricerca (default: "contains")
 * @param caseSensitive - Se la ricerca deve essere case sensitive (default: false)
 * @returns Array di condizioni OR per la ricerca
 *
 * @example
 * // Ricerca semplice con chiavi normali
 * createSearchORConditions(["firstName", "lastName"], "mario")
 * // Risultato: [
 * //   { firstName: { contains: "mario", mode: "insensitive" } },
 * //   { lastName: { contains: "mario", mode: "insensitive" } }
 * // ]
 *
 * @example
 * // Ricerca con chiavi nested
 * createSearchORConditions(["customer.firstName", "customer.lastName"], "mario")
 * // Risultato: [
 * //   { customer: { firstName: { contains: "mario", mode: "insensitive" } } },
 * //   { customer: { lastName: { contains: "mario", mode: "insensitive" } } }
 * // ]
 *
 * @example
 * // Ricerca multi-parola
 * createSearchORConditions(["firstName", "lastName"], "mario rossi")
 * // Risultato: [
 * //   {
 * //     AND: [
 * //       { OR: [
 * //         { firstName: { contains: "mario", mode: "insensitive" } },
 * //         { lastName: { contains: "mario", mode: "insensitive" } }
 * //       ]},
 * //       { OR: [
 * //         { firstName: { contains: "rossi", mode: "insensitive" } },
 * //         { lastName: { contains: "rossi", mode: "insensitive" } }
 * //       ]}
 * //     ]
 * //   }
 * // ]
 */
export function createSearchORConditions(
  searchKeys: string[],
  searchText: string,
  operator: FieldOperator = "contains",
  caseSensitive: boolean = false,
): any[] {
  const trimmedSearch = searchText.trim();

  if (trimmedSearch === "") {
    return [];
  }

  const words = trimmedSearch.split(/\s+/).filter((word) => word.length > 0);

  const searchConditions: any[] = [];

  if (words.length > 1) {
    // Per più parole: ogni parola deve matchare con almeno un campo
    const wordConditions = words.map((word) => ({
      OR: searchKeys.map((key) =>
        createSearchCondition(key, word, operator, caseSensitive),
      ),
    }));

    searchConditions.push({
      AND: wordConditions,
    });
  } else {
    // Per una parola: cerca normalmente in tutti i campi
    searchConditions.push(
      ...searchKeys.map((key) =>
        createSearchCondition(key, trimmedSearch, operator, caseSensitive),
      ),
    );
  }

  return searchConditions;
}

/**
 * Crea una singola condizione di ricerca per una chiave (normale o nested)
 *
 * @param key - Chiave da cercare (es. "firstName" o "customer.firstName")
 * @param value - Valore da cercare
 * @param operator - Operatore di ricerca (default: "contains")
 * @param caseSensitive - Se la ricerca deve essere case sensitive (default: false)
 * @returns Condizione di ricerca
 *
 * @example
 * // Chiave normale
 * createSearchCondition("firstName", "mario", "contains", false)
 * // Risultato: { firstName: { contains: "mario", mode: "insensitive" } }
 *
 * @example
 * // Chiave nested
 * createSearchCondition("customer.firstName", "mario", "contains", false)
 * // Risultato: { customer: { firstName: { contains: "mario", mode: "insensitive" } } }
 *
 * @example
 * // Operatore diverso
 * createSearchCondition("email", "gmail", "endsWith", false)
 * // Risultato: { email: { endsWith: "gmail", mode: "insensitive" } }
 *
 * @example
 * // Case sensitive
 * createSearchCondition("code", "ABC123", "equals", true)
 * // Risultato: { code: { equals: "ABC123" } }
 */
function createSearchCondition(
  key: string,
  value: string,
  operator: FieldOperator = "contains",
  caseSensitive: boolean = false,
): any {
  const searchValue = caseSensitive
    ? { [operator]: value }
    : { [operator]: value, mode: "insensitive" };

  if (key.includes(".")) {
    // Chiave nested - crea la struttura automaticamente
    const keys = key.split(".");
    let condition: any = searchValue;

    // Costruisce la struttura nested dall'interno verso l'esterno
    for (let i = keys.length - 1; i >= 0; i--) {
      condition = { [keys[i]]: condition };
    }

    return condition;
  } else {
    // Chiave normale
    return {
      [key]: searchValue,
    };
  }
}

/**
 * Utility completa per gestire la ricerca testuale con chiavi multiple
 *
 * @param prismaQuery - La query Prisma corrente
 * @param searchKeys - Array di chiavi da cercare (es. ["firstName", "customer.firstName"])
 * @param searchText - Testo da cercare
 * @param operator - Operatore di ricerca (default: "contains")
 * @param caseSensitive - Se la ricerca deve essere case sensitive (default: false)
 * @returns La query aggiornata
 *
 * @example
 * // Query iniziale
 * const initialQuery = {
 *   where: {
 *     status: "active",
 *     OR: [
 *       { firstName: { contains: "old", mode: "insensitive" } }
 *     ]
 *   }
 * };
 *
 * // Ricerca con chiavi normali
 * updateSearchConditions(initialQuery, ["firstName", "lastName"], "mario")
 * // Risultato: {
 * //   where: {
 * //     status: "active",
 * //     OR: [
 * //       { firstName: { contains: "mario", mode: "insensitive" } },
 * //       { lastName: { contains: "mario", mode: "insensitive" } }
 * //     ]
 * //   }
 * // }
 *
 * @example
 * // Ricerca con chiavi nested
 * updateSearchConditions(initialQuery, ["customer.firstName", "customer.lastName"], "mario")
 * // Risultato: {
 * //   where: {
 * //     status: "active",
 * //     OR: [
 * //       { customer: { firstName: { contains: "mario", mode: "insensitive" } } },
 * //       { customer: { lastName: { contains: "mario", mode: "insensitive" } } }
 * //     ]
 * //   }
 * // }
 *
 * @example
 * // Rimozione ricerca (testo vuoto)
 * updateSearchConditions(initialQuery, ["firstName", "lastName"], "")
 * // Risultato: {
 * //   where: {
 * //     status: "active"
 * //   }
 * // }
 *
 * @example
 * // Ricerca multi-parola
 * updateSearchConditions(initialQuery, ["firstName", "lastName"], "mario rossi")
 * // Risultato: {
 * //   where: {
 * //     status: "active",
 * //     OR: [
 * //       {
 * //         AND: [
 * //           { OR: [
 * //             { firstName: { contains: "mario", mode: "insensitive" } },
 * //             { lastName: { contains: "mario", mode: "insensitive" } }
 * //           ]},
 * //           { OR: [
 * //             { firstName: { contains: "rossi", mode: "insensitive" } },
 * //             { lastName: { contains: "rossi", mode: "insensitive" } }
 * //           ]}
 * //         ]
 * //       }
 * //     ]
 * //   }
 * // }
 */
export function updateSearchConditions<T>(
  prismaQuery: PrismaQueryOptions<T> | undefined,
  searchKeys: string[],
  searchText: string,
  operator: FieldOperator = "contains",
  caseSensitive: boolean = false,
): PrismaQueryOptions<T> | undefined {
  const trimmedSearch = searchText.trim();

  if (trimmedSearch === "") {
    // Rimuovi le condizioni di ricerca esistenti
    return cleanORKeys(prismaQuery, searchKeys);
  }

  // Crea le nuove condizioni di ricerca
  const searchConditions = createSearchORConditions(
    searchKeys,
    searchText,
    operator,
    caseSensitive,
  );

  // Aggiorna la query
  return updateORConditions(prismaQuery, searchConditions, searchKeys);
}

/**
 * Pulisce gli oggetti nested vuoti dalla where clause di una query Prisma.
 * Rimuove proprietà undefined e oggetti che diventano vuoti.
 *
 * @param query - La query Prisma da pulire
 * @returns La query pulita senza oggetti nested vuoti
 *
 * @example
 * // Query con customer vuoto
 * const query = { where: { status: "sent", customer: {} } };
 * cleanEmptyNestedObjects(query);
 * // Risultato: { where: { status: "sent" } }
 */
export function cleanEmptyNestedObjects<T>(
  query: PrismaQueryOptions<T>,
): PrismaQueryOptions<T> {
  if (!query.where) {
    return query;
  }

  const cleanedWhere = { ...query.where } as any;

  // Itera su tutte le proprietà del where
  Object.keys(cleanedWhere).forEach((key) => {
    const value = cleanedWhere[key];

    // Se è un oggetto (potenzialmente nested)
    if (value && typeof value === "object" && !Array.isArray(value)) {
      // Rimuovi proprietà undefined
      const cleanedValue = { ...value };
      Object.keys(cleanedValue).forEach((nestedKey) => {
        if (cleanedValue[nestedKey] === undefined) {
          delete cleanedValue[nestedKey];
        }
      });

      // Se l'oggetto è diventato vuoto, rimuovilo
      if (Object.keys(cleanedValue).length === 0) {
        delete cleanedWhere[key];
      } else {
        cleanedWhere[key] = cleanedValue;
      }
    }
  });

  return {
    ...query,
    where: cleanedWhere as PrismaWhere<T>,
  };
}
