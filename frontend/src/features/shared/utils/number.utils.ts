/**
 * Utility functions for handling number values
 * Numbers can be a number or a Decimal object (from Prisma)
 */

/**
 * Normalizza un valore numerico da number o Decimal object a number
 * Gestisce i casi null/undefined con un valore di default
 *
 * @param value - Valore numerico da normalizzare (number, Decimal object, null o undefined)
 * @param defaultValue - Valore di default se value è null/undefined (default: 0)
 * @param allowOptional - Se true, preserva undefined quando value è null/undefined invece di usare defaultValue
 * @returns Number normalizzato o defaultValue (o undefined se allowOptional è true)
 *
 * @example
 * normalizeNumber(100) // 100
 * normalizeNumber({ valueOf: () => "150.50" }) // 150.50
 * normalizeNumber(null) // 0
 * normalizeNumber(null, 50) // 50
 * normalizeNumber(undefined, 0) // 0
 * normalizeNumber(undefined, 0, true) // undefined
 */
export function normalizeNumber(
  value:
    | number
    | string
    | { valueOf: () => string | number }
    | null
    | undefined,
  defaultValue: number = 0,
  allowOptional: boolean = false,
): number | undefined {
  if (
    value === null ||
    value === undefined ||
    (typeof value === "string" && value.trim() === "")
  ) {
    // Se allowOptional è true, preserva undefined
    // Altrimenti usa defaultValue (o 0 se omesso)
    return allowOptional ? undefined : defaultValue;
  }

  let num: number;

  if (typeof value === "object" && "valueOf" in value) {
    // Decimal object from Prisma
    num = parseFloat(String(value.valueOf()));
  } else {
    num = typeof value === "string" ? parseFloat(value) : value;
  }

  if (isNaN(num)) {
    return allowOptional ? undefined : defaultValue;
  }

  return num;
}

/**
 * Normalizza un valore numerico per l'onChange degli input di tipo number
 *
 * ⚠️ IMPORTANTE: Questa funzione è SOLO per l'onChange degli input number, NON per i defaultValues del form.
 * Per i defaultValues, usa direttamente `normalizeNumber()` con i parametri appropriati.
 *
 * Questa funzione è pensata per gestire input numerici come tariffe, salari, dove quando l'utente cancella
 * il valore, l'input deve mostrare una stringa vuota ("") invece di 0.
 *
 * La funzione include automaticamente il controllo per filtrare valori negativi (utile per tariffe,
 * prezzi, quantità che non possono essere negative).
 *
 * @param value - Valore da normalizzare (stringa da e.target.value, number, Decimal object, null o undefined)
 * @returns Number normalizzato se value esiste ed è positivo, stringa vuota ("") se value è null/undefined/vuoto/negativo
 *
 * @example
 * // Uso semplificato in onChange di un input number (tariffe, prezzi, salari, ecc.)
 * <Input
 *   type="number"
 *   value={field.value ?? ""}
 *   onChange={(e) => {
 *     field.onChange(normalizeNumberForForm(e.target.value));
 *   }}
 * />
 *
 * @note
 * - ✅ Testata e funzionante per input di tipo number (tariffe, prezzi, quantità numeriche)
 * - ✅ Filtra automaticamente valori negativi (non necessario aggiungere controlli manuali)
 * - ⚠️ NON testata per input di tipo text che devono contenere numeri
 * - ❌ NON usare per defaultValues del form - usa normalizeNumber() invece
 */
export function normalizeNumberForForm(
  value:
    | string
    | number
    | { valueOf: () => string | number }
    | null
    | undefined,
): number | "" | undefined {
  // Se il valore è vuoto, null o undefined, ritorna stringa vuota
  if (value === null || value === undefined || value === "") {
    return "";
  }

  // Converte stringa a number se necessario
  const numValue =
    typeof value === "string"
      ? value.trim() === ""
        ? undefined
        : parseFloat(value)
      : typeof value === "object" && "valueOf" in value
        ? parseFloat(String(value.valueOf()))
        : value;

  // Se il valore convertito è NaN, ritorna stringa vuota
  if (numValue === undefined || isNaN(numValue)) {
    return "";
  }

  // Filtra valori negativi (utile per tariffe, prezzi, quantità)
  if (numValue < 0) {
    return "";
  }

  return numValue;
}
