# Confronto Componenti Select

Guida rapida per scegliere il componente select corretto in base alle esigenze.

## Tabella Comparativa

| Caratteristica        | MultiSelect           | SearchableSelect         | SearchableSelectPaginated         | SearchableMultiSelectPaginated         |
| --------------------- | --------------------- | ------------------------ | --------------------------------- | -------------------------------------- |
| **Selezione**         | Multipla (`string[]`) | Singola (`string`)       | Singola (`string`)                | Multipla (`string[]`)                  |
| **Ricerca**           | ✅ Client-side        | ✅ Server-side           | ✅ Server-side                    | ✅ Server-side                         |
| **Initial Items**     | ✅ Sì (array prop)    | ❌ No (di default)       | ✅ Sì (paginata)                  | ✅ Sì (paginata)                       |
| **Pagination**        | ❌ No                 | ❌ No                    | ✅ Sì                             | ✅ Sì                                  |
| **Scroll Infinito**   | ❌ No                 | ❌ No                    | ✅ Sì                             | ✅ Sì                                  |
| **Badge Selezionati** | ✅ Sì                 | ❌ No                    | ❌ No                             | ✅ Sì                                  |
| **Hook Dedicato**     | ❌ No                 | ✅ `useSearchableSelect` | ✅ `useSearchableSelectPaginated` | ✅ `useSearchableMultiSelectPaginated` |
| **Dataset Size**      | ≤200 elementi         | ≤200 elementi            | >200 elementi                     | >200 elementi                          |
| **Items Source**      | Array già caricato    | API (ricerca)            | API (paginazione + ricerca)       | API (paginazione + ricerca)            |
| **Loading State**     | ✅ `isLoading` prop   | ✅ `isSearching`         | ✅ `isLoading` + `isLoadingMore`  | ✅ `isLoading` + `isLoadingMore`       |
| **Max Selections**    | ✅ Sì                 | ❌ No                    | ❌ No                             | ✅ Sì                                  |
| **Debounce**          | ❌ No (client)        | ✅ Sì (300ms default)    | ✅ Sì (300ms default)             | ✅ Sì (300ms default)                  |

## Quando Usare

### MultiSelect

✅ **Usa quando:**

- Selezione multipla necessaria
- Array già caricato disponibile
- Dataset ≤200 elementi
- Ricerca client-side sufficiente

❌ **Non usare quando:**

- Dataset >200 elementi
- Serve ricerca server-side
- Serve paginazione

### SearchableSelect

✅ **Usa quando:**

- Selezione singola necessaria
- Dataset ≤200 elementi
- Non serve lista iniziale
- Utente deve cercare per trovare

❌ **Non usare quando:**

- Dataset >200 elementi
- Serve lista iniziale (usa `SearchableSelectPaginated`)
- Serve selezione multipla

### SearchableSelectPaginated

✅ **Usa quando:**

- Selezione singola necessaria
- Dataset >200 elementi
- Serve lista iniziale navigabile
- Serve scroll infinito

❌ **Non usare quando:**

- Dataset ≤200 elementi (usa `SearchableSelect`)
- Serve selezione multipla (usa `SearchableMultiSelectPaginated`)

### SearchableMultiSelectPaginated

✅ **Usa quando:**

- Selezione multipla necessaria
- Dataset >200 elementi
- Serve lista iniziale navigabile
- Serve scroll infinito
- Serve ricerca server-side

❌ **Non usare quando:**

- Dataset ≤200 elementi (usa `MultiSelect`)
- Array già caricato disponibile (usa `MultiSelect`)

## Configurazione Prisma

### SearchableSelect

```typescript
queryOptions: {
  take: 200, // Limita risultati ricerca
}
```

### SearchableSelectPaginated / SearchableMultiSelectPaginated

```typescript
paginationQueryOptions: {
  // Query per lista iniziale (pagina per pagina)
  orderBy: { name: "asc" },
},
searchQueryOptions: {
  take: 200, // Limita risultati ricerca
  orderBy: { name: "asc" },
},
pageSize: 24, // Dimensione pagina
```

## Pattern Naming

### Componenti Base

- `MultiSelect` - Client-side, array locale
- `SearchableSelect` - Server-side, no paginazione
- `SearchableSelectPaginated` - Server-side, paginato
- `SearchableMultiSelectPaginated` - Server-side, paginato, multipla

### Field Components

- `{Entity}MultiSelectField` - Usa `MultiSelect`
- `{Entity}SearchSelectField` - Usa `SearchableSelect`
- `{Entity}SearchSelectPaginatedField` - Usa `SearchableSelectPaginated`
- `{Entity}SearchMultiSelectPaginatedField` - Usa `SearchableMultiSelectPaginated`

### Filter Components

- `{Entity}SearchSelectFilter` - Usa `SearchableSelect`
- `{Entity}SearchSelectPaginatedFilter` - Usa `SearchableSelectPaginated`

## Esempi Pratici

### Expertise

- **≤200 elementi**: `ExpertiseMultiSelectField` (usa `MultiSelect`)
- **>200 elementi**: `ExpertiseSearchMultiSelectPaginatedField` (usa `SearchableMultiSelectPaginated`)

### City

- **≤200 elementi**: `CitySearchSelectField` (usa `SearchableSelect`)
- **>200 elementi**: `CitySearchSelectPaginatedField` (usa `SearchableSelectPaginated`)

## Note Importanti

1. **Ricerca Server-side**: Sempre indipendente dai dati mostrati, fa chiamate API separate
2. **Initial Items**: `SearchableSelect` non mostra lista iniziale di default (workaround possibile ma non consigliato)
3. **Pagination**: Solo per dataset >200 elementi, altrimenti usa versione non paginata
4. **Client vs Server**: Client-side filtra array locale, server-side fa chiamate API
5. **Workaround SearchableSelect**: È possibile mostrare una lista iniziale passando `results` condizionalmente, ma non è consigliato - usa `SearchableSelectPaginated` invece
