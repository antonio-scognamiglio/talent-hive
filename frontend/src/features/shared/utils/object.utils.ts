/**
 * Accede a un valore nested in un oggetto usando un path con punti (es: "user.city.province")
 *
 * Gestisce in modo sicuro:
 * - Path vuoti o invalidi
 * - Valori null/undefined nel percorso
 * - Proprietà inesistenti
 * - Typo nel path
 *
 * @param obj - L'oggetto da cui estrarre il valore
 * @param path - Il path del campo, con punti come separatori (es: "user.city.province")
 * @returns Il valore trovato o undefined se il path non esiste o è invalido
 *
 * @example
 * const user = { city: { province: "Roma" } };
 * getNestedValue(user, "city.province"); // "Roma"
 * getNestedValue(user, "city.region"); // undefined
 * getNestedValue(user, ""); // undefined
 * getNestedValue(null, "city.province"); // undefined
 */
export function getNestedValue<T = unknown>(
  obj: unknown,
  path: string
): T | undefined {
  // Gestione casi edge: path vuoto, null, undefined, o non stringa
  if (!path || typeof path !== "string" || path.trim() === "") {
    return undefined;
  }

  // Gestione oggetto null/undefined
  if (obj === null || obj === undefined) {
    return undefined;
  }

  // Split del path e navigazione sicura
  const keys = path.split(".").filter((key) => key.trim() !== "");

  // Se dopo il filter non ci sono chiavi valide, ritorna undefined
  if (keys.length === 0) {
    return undefined;
  }

  try {
    // Navigazione sicura attraverso le proprietà
    let current: unknown = obj;

    for (const key of keys) {
      // Se current è null/undefined, non possiamo accedere a proprietà
      if (current === null || current === undefined) {
        return undefined;
      }

      // Se current non è un oggetto/array, non possiamo accedere a proprietà nested
      if (typeof current !== "object") {
        return undefined;
      }

      // Accesso sicuro alla proprietà (gestisce anche array con indici numerici)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      current = (current as any)[key];

      // Se durante la navigazione troviamo undefined, fermiamoci
      if (current === undefined) {
        return undefined;
      }
    }

    return current as T;
  } catch (error) {
    // In caso di errori imprevisti (es: accesso a proprietà non configurabili)
    // restituiamo undefined invece di lanciare
    console.warn(
      `Errore nell'accesso al path "${path}":`,
      error instanceof Error ? error.message : String(error)
    );
    return undefined;
  }
}
