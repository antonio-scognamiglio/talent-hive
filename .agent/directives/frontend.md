---
alwaysApply: true
---

# TalentHive Frontend Patterns

> **REGOLA D'ORO**: L'agente NON può modificare questo file. Solo l'utente può farlo.

## Quick Reference Paths

- **Components**: `@/features/shared/components/` → `@/components/ui/` (Shadcn)
- **Utils**: `@/features/shared/utils/` → feature-specific `utils/`
- **Types**: `@shared/types` (generated from Prisma) → feature `types/` (UI-only)
- **Forms**: Schemas in `{feature}/schemas/{entity}-schema.ts` (Zod). Form components in `{feature}/components/forms/` or inline in dialogs.
- **Services**: `@/features/shared/services/{entity}.service.ts` (axios + apiClient)

---

## Feature-Based Architecture

Ogni feature in `src/features/{feature-name}/` con:

```
{feature}/
├── components/
│   ├── dialogs/        # XxxDialog.tsx
│   ├── forms/          # XxxForm.tsx (standalone)
│   ├── fields/         # Feature-specific fields
│   └── filters/        # Feature-specific filters (es. ApplicationStatusFilter)
├── hooks/              # useXxx.ts
├── mappers/            # Query builders (usano prisma-query-utils)
├── schemas/            # {entity}-schema.ts (Zod only, NO components)
├── services/           # (optional, if not in shared)
├── types/              # UI-only types
├── utils/
└── index.ts            # Barrel export
```

---

## Filter Components

### Organizzazione

- **Filtri comuni** (SearchInput, OrderByFilter, NumberFilter): `shared/components/filters/`
- **Filtri feature-specific** (ApplicationStatusFilter, JobTypeFilter): `{feature}/components/filters/`

### Pattern Styling

- **Componente interno**: Usare sempre `w-full` come default nel SelectTrigger/Input
- **Componente esterno (nel Toolbar)**: Usare `flex-X min-w-XX` per responsiveness
- **MAI** larghezze fisse (w-44, w-48) - i filtri devono adattarsi allo spazio disponibile

```tsx
// ✅ Nel componente filtro (OrderByFilter, StatusFilter, etc.)
<SelectTrigger className={cn("w-full", className)}>

// ✅ Nel Toolbar - flex per distribuzione + min-w per leggibilità minima
<Toolbar
  leftContent={
    <>
      <SearchInput className="flex-2 min-w-72 sm:min-w-96" ... />
      <StatusFilter className="flex-1 min-w-48 sm:min-w-60" ... />
      <OrderByFilter className="flex-1 min-w-48 sm:min-w-60" ... />
    </>
  }
  rightContent={
    <>
      {/* Reset Button (Primo a sinistra nel rightContent) */}
      <GhostButton
        text="Azzera filtri"
        onClick={resetFilters}
        disabled={activeFiltersCount === 0}
        icon={<X className="h-4 w-4" />}
      />
      <RefreshButton refetch={refetch} isLoading={isFetching} />
    </>
  }
/>

### Reset Filters
Quando sono presenti filtri, DEVE essere presente un pulsante di reset:
1.  **Placement**: `rightContent` del Toolbar, come **PRIMO** elemento.
2.  **Order**: Reset Filters → RefreshButton → Primary Actions (es. "Crea").
3.  **Component**: `GhostButton` (stile minimale).
4.  **Stato**: Sempre visibile, `disabled` se `activeFiltersCount === 0`.
5.  **Hook**: Il custom hook dei filtri (`useXxxFilters`) deve esporre `resetFilters` e `activeFiltersCount`.
```

**Perché flex + min-w?**

- `flex-X` → distribuisce lo spazio proporzionalmente tra i filtri
- `min-w-XX` → garantisce larghezza minima per leggibilità
- `sm:min-w-XX` → breakpoint per schermi più grandi

### Filter Mappers (prisma-query-utils)

Per costruire le query Prisma nei mapper, **USARE SEMPRE** le utilities da `@/features/shared/utils/prisma-query-utils`:

| Utility                    | Uso                                       |
| -------------------------- | ----------------------------------------- |
| `updateSearchConditions`   | Ricerca testuale (supporta nested keys)   |
| `cleanPrismaQuery`         | Aggiorna filtri where/orderBy             |
| `cleanEmptyNestedObjects`  | Pulisce oggetti vuoti dalla query         |
| `createSearchORConditions` | Crea condizioni OR per multi-field search |

```tsx
// Esempio mapper
import {
  updateSearchConditions,
  cleanPrismaQuery,
} from "@/features/shared/utils/prisma-query-utils";

export function applyFeatureFilters(baseQuery, filters) {
  let result = { ...baseQuery };

  // Ricerca su campo nested
  if (filters.searchTerm) {
    result = updateSearchConditions(result, ["job.title"], filters.searchTerm);
  }

  // Filtro where semplice
  if (filters.status) {
    result = cleanPrismaQuery(result, "status", filters.status, "where");
  }

  return cleanEmptyNestedObjects(result);
}
```

**CRITICAL DECISION RULE**: Components belong to the feature that **OWNS THE DATA**, not where they're used.

- `ApplyJobDialog` manages `Application` → `applications/components/dialogs/`
- Even if used in `jobs/` pages

---

## Page Structure

Ogni pagina DEVE usare i componenti layout da `@/features/shared/components/layout/`.

### Pagine Lista (es. CandidateJobsPage)

```tsx
import { PageContent, PageHeader } from "@/features/shared/components/layout";

<PageContent>
  <PageHeader title="Jobs Marketplace" subtitle="Cerca e candidati..." />
  <Toolbar ... />
  {/* Contenuto lista */}
</PageContent>
```

### RefreshButton Placement

Il `RefreshButton` va sempre in UNO di questi posti (mai entrambi, mai nel PageHeader):

| Scenario                    | Dove va RefreshButton        |
| --------------------------- | ---------------------------- |
| C'è Toolbar (filtri)        | In rightContent (con azioni) |
| No Toolbar, c'è CustomTable | Nel ContentCard header       |

```tsx
// ✅ Con Toolbar (filtri presenti):
// leftContent = filtri, rightContent = azioni (+ RefreshButton)
<Toolbar
  variant="plain"
  leftContent={
    <>
      <SearchInput ... />
      <StatusFilter ... />
    </>
  }
  rightContent={
    <>
      <PrimaryButton text="Crea" ... />
      <RefreshButton refetch={refetch} isLoading={isFetching} />
    </>
  }
/>

// ✅ Senza Toolbar (tabella senza filtri)
<ContentCard
  refreshButton={{ refetch, isLoading: isFetching }}
>
  <CustomTable ... />
</ContentCard>
```

**Regola**: Lo stato di loading per RefreshButton è `isFetching`, NON `isLoading`.

### Pagine Dettaglio (es. CandidateJobDetailPage)

```tsx
import { PageContent } from "@/features/shared/components/layout";
import { DetailPageHeader } from "@/features/shared/components/layout";

<PageContent>
  <DetailPageHeader
    title="Dettaglio Annuncio"
    subTitle={<Badge>Status</Badge>}
    backLabel="Torna agli annunci"
    rightAction={<Button>Azione</Button>}
  />
  {/* Contenuto dettaglio */}
</PageContent>;
```

---

## Table Patterns

### Column Factory Pattern

Per definire le configurazioni delle colonne per `CustomTable`, usare SEMPRE il pattern **Column Factory Function**.
Questo approccio permette di iniettare dipendenze (es. callbacks, lingua, userid) e centralizza la logica di presentazione.

**File**: `{feature}/utils/{entity}-columns.utils.tsx` (o `.ts` se non ritorna JSX)

```tsx
interface CreateJobColumnsConfigOptions {
  onView?: (job: Job) => void;
  onEdit?: (job: Job) => void;
  onDelete?: (job: Job) => void;
}

/**
 * Factory function per creare la configurazione delle colonne Jobs.
 */
export function createJobColumnsConfig({
  onView,
  onEdit,
  onDelete,
}: CreateJobColumnsConfigOptions): ColumnConfig<Job>[] {
  // Helpers per rendering celle (mantengono pulito l'array columns)
  const getStatusBadge = (status: Job["status"]) => {
    return <Badge>{status}</Badge>;
  };

  const columns: ColumnConfig<Job>[] = [
    {
      key: "title",
      header: "Titolo",
      width: { default: 3 },
      cell: (job) => <span className="font-bold">{job.title}</span>,
    },
    // ... altre colonne
  ];

  // Aggiungi azioni solo se i callback sono forniti
  if (onView || onEdit || onDelete) {
    columns.push({
      key: "actions",
      header: "",
      width: { default: 1 },
      align: "right",
      cell: (job) => (
        <div className="flex items-center justify-end gap-2">
          {onView && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => onView(job)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Vedi dettagli</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* ... altri bottoni con tooltip ... */}
        </div>
      ),
    });
  }

  return columns;
}
```

**Utilizzo nella Pagina**:

```tsx
const columns = useMemo(
  () =>
    createJobColumnsConfig({
      onView: (job) => navigate(`/jobs/${job.id}`),
      onEdit: (job) => openDialog("edit", job),
    }),
  [navigate],
);
```

---

## PaginationWrapper + CustomTable Pattern

Quando si usa `PaginationWrapperStyled` con `CustomTableStyled`:

1. **SEMPRE spread props**: `{(props) => <CustomTableStyled {...props} ... />}`
2. **Props aggiuntive dopo lo spread**: `columns` e `emptyState` sono le uniche props da aggiungere esplicitamente.
3. **customEmptyState**: Definire SEMPRE un `customEmptyState` con `EmptyState` e icona appropriata.

### Reference Pattern (COPIARE ESATTAMENTE):

```tsx
<PaginationWrapperStyled<Entity>
  data={data}
  isLoading={isLoading}
  isError={isError}
  error={error}
  currentPage={currentPage}
  totalPages={totalPages}
  nextPage={nextPage}
  prevPage={prevPage}
  handlePageClick={handlePageClick}
  pageSizeConfig={{ ... }}
  totalItemsConfig={{ ... }}
>
  {(props) => {
    const customEmptyState = (
      <EmptyState
        icon={<EntityIcon />}
        title="Nessun elemento trovato"
        description="Non ci sono elementi che corrispondono ai tuoi filtri."
      />
    );

    return (
      <CustomTableStyled<Entity>
        {...props}
        columns={columns}
        emptyState={customEmptyState}
      />
    );
  }}
</PaginationWrapperStyled>
```

---

## State Components (Liste)

Per le pagine lista, usare i componenti di stato corretti nel children render di `PaginationWrapper`:

| Componente   | Uso                              |
| ------------ | -------------------------------- |
| `Spinner`    | Stato di caricamento (isLoading) |
| `ErrorState` | Errore di caricamento (isError)  |
| `EmptyState` | Lista vuota (data.length === 0)  |

**Ordine condizioni (OBBLIGATORIO):**

```tsx
{({ data, isLoading, isError, refetch }) => (
  <>
    {isLoading ? (
      <Spinner message="Caricamento..." />
    ) : isError ? (
      <ErrorState
        title="Errore di caricamento"
        description="Non è stato possibile caricare i dati."
        onRetry={() => refetch?.()}
      />
    ) : data.length === 0 ? (
      <EmptyState
        icon={<Icon />}
        title="Nessun elemento"
        description="Descrizione..."
      />
    ) : (
      // Render lista
    )}
  </>
)}
```

**Regola**: MAI mostrare `EmptyState` se `isError` è true. È fuorviante mostrare "nessun elemento" quando il caricamento è fallito.

---

## Performance Optimization (useCallback / useMemo)

Usare `useCallback` e `useMemo` per evitare ri-creazione di funzioni e variabili ad ogni render:

### useCallback - Quando usarlo

```tsx
// ✅ Handler passati a componenti child con memo o in dependency array
const handleClick = useCallback(
  (id: string) => {
    doSomething(id);
  },
  [doSomething],
);

// ✅ Funzioni passate come prop a CustomDialog, Card, TableRow, etc.
const handleApplicationClick = useCallback(
  (application: Application) => {
    applicationDialog.openDialog(application, "view");
  },
  [applicationDialog],
);

// ❌ NON serve per handler inline semplici che non vengono passati
<button onClick={() => setOpen(true)}>Open</button>;
```

### useMemo - Quando usarlo

```tsx
// ✅ Calcoli costosi o derivazioni da props/state
const filteredItems = useMemo(
  () => items.filter((item) => item.active),
  [items],
);

// ✅ Oggetti passati come dependency o a componenti memoizzati
const prismaQuery = useMemo<PrismaQueryOptions>(
  () => ({
    where: { status: "active" },
  }),
  [],
);

// ✅ Configurazione colonne tabella
const columns = useMemo(
  () => createColumnsConfig({ language, onEdit }),
  [language, onEdit],
);

// ❌ NON serve per primitive o calcoli semplici
const isActive = status === "active"; // NO useMemo needed
```

**Regola**: Quando in dubbio, chiediti: "Questa funzione/variabile viene passata a child components o usata come dependency?". Se sì → usa useCallback/useMemo.

---

## React Anti-Patterns & Best Practices

### ⚠️ useEffect Anti-Patterns

Il 90% dei bug React proviene dall'uso errato di `useEffect`.

**Regola d'Oro**: "Se puoi evitare un useEffect, evitalo."

| Anti-Pattern            | Perché è sbagliato                                                            | Soluzione Corretta                                                                   |
| ----------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **Sync Props → State**  | Causa re-render inutili e loop di aggiornamento                               | Inizializza `useState(prop)`. Se prop cambia e serve reset, usa **Key-Based Reset**. |
| **Sync URL ↔ State**    | Race conditions (URL aggiornato in ritardo, effetto ripristina vecchi valori) | Inizializza stato locale da URL. Aggiorna URL e Stato _insieme_ nell'handler.        |
| **Trasformazione Dati** | Effetto a cascata                                                             | Fai la trasformazione nel render o con `useMemo`.                                    |

### ✅ Key-Based Reset Pattern

Invece di usare `useEffect` per "ascoltare" un reset o un cambio prop complesso:

1. **Parent**: Gestisce una chiave (es. `resetKey` o `version`).
2. **Parent**: Passa la chiave come prop `key` al componente child.
3. **Reset**: Parent incrementa la chiave.
4. **React**: Smonta e rimonta il child → stato locale riparte da zero (pulito).

```tsx
// ❌ SBAGLIATO (Sync Effect)
function SearchInput({ value }) {
  const [term, setTerm] = useState(value);

  // Causa loop, blinking, e race conditions
  useEffect(() => {
    setTerm(value);
  }, [value]);
}

// ✅ CORRETTO (Key-Based Reset)
function Parent() {
  const [resetKey, setResetKey] = useState(0);

  const handleReset = () => {
    setResetKey((k) => k + 1); // Incrementa key
    setFilterValue(undefined); // Pulisce stato parent
  };

  return (
    <SearchInput
      key={`search-${resetKey}`} // Forza remount al reset
      initialValue={filterValue}
    />
  );
}

function SearchInput({ initialValue }) {
  // Stato nasce pulito ad ogni remount
  const [term, setTerm] = useState(initialValue);
  // NESSUN useEffect di sync necessario!
}
```

---

## Field Components (DRY)

**PRIMA di creare input custom**, controllare `@/features/shared/components/fields/`:

| Componente           | Uso                            |
| -------------------- | ------------------------------ |
| `PasswordInputField` | Password con toggle visibilità |
| `EmailInputField`    | Email con validazione          |
| `TextInputField`     | Testo generico                 |
| `TextareaField`      | Textarea multilinea            |
| `FileUploadField`    | Upload file                    |

Questi componenti usano `FormField` di react-hook-form e richiedono `<Form>` wrapper.

```tsx
import { PasswordInputField } from "@/features/shared/components/fields";

<Form {...form}>
  <PasswordInputField
    control={form.control}
    name="password"
    label="Password"
    required
  />
</Form>;
```

---

## Routes Config

Quando aggiungi nuove pagine in `routes.config.tsx`:

1. **Lazy component in CIMA** al file (non inline)

   ```tsx
   const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
   ```

2. **showInSidebar: true** di default (preferire doppio collegamento Sidebar + UserMenu)

3. **Icona appropriata** nel meta

---

## Filter & Pagination Pattern

Pattern completo per liste filtrabili con sincronizzazione URL. Vedi `CandidateJobsPage` come riferimento.

### Architettura (Matriosca)

```
Pagina (CandidateJobsPage)
├── useJobFilters (hook feature-specific)
│   ├── useUrlFilters (hook generico per URL sync)
│   ├── applyJobFilters (mapper che costruisce prismaQuery)
│   └── JOB_FILTER_PARAM_CONFIGS (config parse/serialize)
├── useJobsWithApplicationStatus (hook dati + paginazione)
├── Toolbar + Filter Components (UI)
│   ├── SearchInput
│   ├── NumberFilter
│   └── OrderByFilter
└── PaginationWrapperStyled (wrapper paginazione)
```

### 1. Hook URL Filters (generico, in shared)

```tsx
// @/features/shared/hooks/useUrlFilters.ts
const { filtersFromUrl, setFiltersInUrl } = useUrlFilters<JobUrlFilters>(
  JOB_FILTER_PARAM_CONFIGS, // Config parse/serialize
  { searchTerm: "" }, // Defaults
);
```

### 2. Hook Filters Feature-Specific

```tsx
// @/features/jobs/hooks/useJobFilters.ts
export function useJobFilters({ baseQuery }: UseJobFiltersProps) {
  const { filtersFromUrl, setFiltersInUrl } = useUrlFilters(...);

  // Stati locali derivati dall'URL
  const [searchTerm, setSearchTerm] = useState(filtersFromUrl.searchTerm ?? "");

  // Costruisce prismaQuery con filtri
  const prismaQuery = useMemo(() => applyJobFilters(baseQuery, filters), [...]);

  // Handler che aggiornano stato E URL
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    setFiltersInUrl({ searchTerm: term });
  }, [setFiltersInUrl]);

  return { searchTerm, prismaQuery, handleSearch, ... };
}
```

### 3. Mapper/Query Builder

```tsx
// @/features/jobs/mappers/applyJobFilters.ts
export function applyJobFilters(baseQuery, filters): PrismaQueryOptions<Job> {
  let result = baseQuery;
  if (filters.searchTerm)
    result = getJobSearchFilterCleanedQuery(result, filters.searchTerm);
  // ... altri filtri
  return cleanEmptyNestedObjects(result);
}
```

### 4. Componenti Filter (in shared)

```tsx
<Toolbar
  variant="plain"
  leftContent={
    <>
      <SearchInput
        value={searchTerm}
        onSearch={handleSearch}
        debounceMs={500}
      />
      <NumberFilter
        value={salaryMin}
        onChange={handleSalaryMinChange}
        prefix="€"
      />
      <OrderByFilter
        value={orderBy}
        onChange={handleOrderByChange}
        options={JOB_ORDER_BY_OPTIONS}
      />
      <RefreshButton refetch={refetch} isLoading={isFetching} />
    </>
  }
/>
```

### 5. Pagination Wrapper

```tsx
<PaginationWrapperStyled<Job>
  data={jobs}
  isLoading={isLoading}
  currentPage={currentPage}
  totalPages={totalPages}
  nextPage={nextPage}
  prevPage={prevPage}
  handlePageClick={handlePageClick}
  pageSizeConfig={{ value: pageSize, onValueChange: handlePageSizeChange }}
  totalItemsConfig={{ totalItems, singularText: "Offerta", pluralText: "Offerte" }}
>
  {({ data: paginatedJobs, isLoading }) => (
    // Render list or EmptyState
  )}
</PaginationWrapperStyled>
```

---

## Dialog Pattern

### Componenti

- **CustomDialog**: Wrapper con `smartAutoClose`, header/footer config
- **useStateDialog**: Hook gestione stato multi-dialog

### Pattern Utilizzo

```tsx
// 1. Hook nel parent
const dialog = useStateDialog<EntityType>(["create", "update", "delete"]);

// 2. Conditional rendering
{
  dialog.isDialogOpen("create") && (
    <CreateEntityDialog
      isOpen={true}
      onClose={dialog.closeDialog}
      // ... props
    />
  );
}
```

### CustomDialog Props (smartAutoClose)

`smartAutoClose` previene la chiusura accidentale quando il form ha dati non salvati.

**Opzione 1: Form inline nel dialog** (accesso diretto a `isDirty`)

```tsx
// Dialog con form definito inline
const form = useForm<FormValues>({ ... });

<CustomDialog
  isOpen={isOpen}
  onClose={handleCancel}
  smartAutoClose={true}
  isSafeToAutoClose={!form.formState.isDirty}
  header={{ ... }}
  footer={{
    secondaryButton: { text: "Annulla", onClick: handleCancel },
    primaryButton: { text: "Salva", onClick: form.handleSubmit(handleSubmit) },
  }}
>
  <Form {...form}>...</Form>
</CustomDialog>
```

**Opzione 2: Form come componente separato** (callback `onDirtyChange`)

```tsx
// Dialog
const [isFormDirty, setIsFormDirty] = useState(false);

<CustomDialog
  smartAutoClose={true}
  isSafeToAutoClose={!isFormDirty}
>
  <MyForm onDirtyChange={setIsFormDirty} ... />
</CustomDialog>

// Form component
interface MyFormProps {
  onDirtyChange?: (isDirty: boolean) => void;
}

export function MyForm({ onDirtyChange }: MyFormProps) {
  const form = useForm(...);

  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
  }, [form.formState.isDirty, onDirtyChange]);

  return <Form {...form}>...</Form>;
}
```

### Layout Form in Dialog

```tsx
<CustomDialog header={...}>
  <Form {...form}>
    <form onSubmit={...} className="flex flex-col h-full">
      {/* Content scrollabile */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        {/* Form fields */}
      </div>
      {/* Footer fisso DENTRO form */}
      <div className="shrink-0 border-t p-4 flex justify-end gap-2">
        <SecondaryButton type="button" onClick={onClose} text="Annulla" />
        <PrimaryButton type="submit" disabled={isPending} text="Salva" />
      </div>
    </form>
  </Form>
</CustomDialog>
```

**CRITICAL**: Footer DENTRO `<form>` per Enter key submit.

### Dialog Types

| Componente           | Uso                                       |
| -------------------- | ----------------------------------------- |
| `CustomDialog`       | Form e contenuti complessi                |
| `ConfirmationDialog` | Azioni distruttive (delete, logout, etc.) |

### Hooks per Dialog

| Hook                | Uso                                |
| ------------------- | ---------------------------------- |
| `useDialog`         | Dialog stateless (solo open/close) |
| `useStateDialog<T>` | Multi-dialog con dati associati    |

```tsx
// Stateless (es. ChangePasswordDialog)
const { isShown, openDialog, closeDialog } = useDialog();

// Con stato (es. Edit/Delete con entity)
const dialog = useStateDialog<Job>(["edit", "delete"]);
dialog.openDialog("edit", job);
```

---

## Form Pattern

### Schema (Zod)

```tsx
// {feature}/schemas/{entity}-schema.ts
import { z } from "zod";

export const createEntitySchema = z.object({
  name: z.string().min(1, "Nome obbligatorio"),
  description: z.string().optional(),
});

export type CreateEntityFormValues = z.infer<typeof createEntitySchema>;
```

### Form Component

```tsx
// {feature}/components/forms/CreateEntityForm.tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createEntitySchema,
  type CreateEntityFormValues,
} from "../../schemas/entity-schema";

export function CreateEntityForm({ control, isSubmitting }) {
  return <div className="space-y-4">{/* Form fields using control */}</div>;
}
```

### Regole Form

- **Separate create/update**: Mai un componente che fa entrambi
- **Conditional rendering**: Dialog smontato = form resettato automaticamente
- **NO useEffect reset**: Non usare `useEffect` per reset on `isOpen` change
- **Optional fields**: `undefined`, mai stringa vuota `""`

---

## Hook Pattern (TanStack Query)

### Query Hook

```tsx
export const useMyApplications = ({
  enabled = true,
  config = { ... }
}: UseMyApplicationsProps = {}) => {
  const queryClient = useQueryClient();

  const query = useQuery<Application[], Error>({
    queryKey: queryKeys.applications.my,
    queryFn: applicationsService.getMyApplications,
    enabled,
  });

  const createMutation = useMutation({
    mutationFn: (data) => applicationsService.createApplication(data),
    onSuccess: (response) => {
      if (config.refetchOnSuccess) {
        queryClient.invalidateQueries({ queryKey: queryKeys.applications.my });
      }
      if (config.showSuccessToast) {
        handleSuccess(response, "Creato con successo!");
      }
    },
    onError: (error) => {
      if (config.showErrorToast) {
        handleError(error, "Errore durante la creazione");
      }
    },
  });

  return { ...query, createMutation };
};
```

### MutationConfigMap

```tsx
interface UseMyApplicationsProps {
  enabled?: boolean;
  config?: MutationConfigMap<"applyJob">;
}
```

---

## Data Hooks Pattern (Liste Paginate)

Pattern completo per hook dati con paginazione. Vedi `useJobs`, `useJobsWithApplicationStatus`.

### Architettura Hook Dati

```
usePaginationForGen (hook generico, in pagination/)
    ↓ usato da
useJobs (hook feature con CRUD mutations)
    ↓ usato da
useJobsWithApplicationStatus (hook composito che arricchisce dati)
    ↓ usato da
CandidateJobsPage (pagina)
```

### 1. usePaginationForGen (Base)

Hook generico per **qualsiasi lista paginata**. Gestisce:

- Parametri `take`/`skip` automatici
- Navigazione pagine (`nextPage`, `prevPage`, `handlePageClick`)
- Query key factory per cache invalidation

```tsx
// @/features/pagination/hooks/usePaginationForGen.tsx
const paginatedQuery = usePaginationForGen<Job>({
  pageSize,
  apiFunction: jobsService.listJobs,
  prismaQuery: defaultPrismaQuery, // where, orderBy, include
  enabled: isQueryEnabled,
  queryKeyFactory: queryKeys.jobs.list, // Per invalidation
});

// Returns: data, isLoading, currentPage, totalPages, nextPage, prevPage, etc.
```

### 2. Feature Hook con Mutations

Hook feature-specific che wrappa `usePaginationForGen` + aggiunge CRUD mutations.

```tsx
// @/features/jobs/hooks/useJobs.ts
export const useJobs = ({
  pageSize,
  defaultPrismaQuery,
  config,
}: UseJobsProps) => {
  const queryClient = useQueryClient();

  // Query paginata
  const getJobsPaginatedQuery = usePaginationForGen<Job>({
    pageSize,
    apiFunction: jobsService.listJobs,
    prismaQuery: defaultPrismaQuery,
    queryKeyFactory: queryKeys.jobs.list,
  });

  // Mutations con config MutationConfigMap
  const createJobMutation = useMutation({
    mutationFn: jobsService.createJob,
    onSuccess: (response) => {
      if (config.createJob?.refetchOnSuccess) {
        queryClient.invalidateQueries({
          queryKey: getJobsPaginatedQuery.queryKey,
        });
      }
      if (config.createJob?.showSuccessToast) handleSuccess(response, "...");
    },
    onError: (error) => {
      if (config.createJob?.showErrorToast) handleError(error, "...");
    },
  });

  return {
    getJobsPaginatedQuery,
    createJobMutation,
    updateJobMutation,
    deleteJobMutation,
  };
};
```

### 3. Hook Composito (Arricchimento Dati)

Hook che combina più query per arricchire i dati.

```tsx
// @/features/jobs/hooks/useJobsWithApplicationStatus.ts
export const useJobsWithApplicationStatus = (props?: UseJobsProps) => {
  const jobsQuery = useJobs(props);
  const { data: myApplications } = useMyApplications();

  // Arricchisce ogni job con hasApplied e myApplication
  const jobsWithStatus = useMemo(
    () =>
      jobsQuery.getJobsPaginatedQuery.data?.map((job) => ({
        ...job,
        hasApplied: appliedJobIds.has(job.id),
        myApplication: myApplications?.find((app) => app.jobId === job.id),
      })),
    [jobsQuery.getJobsPaginatedQuery.data, myApplications],
  );

  // Espone FLAT interface per la pagina
  return {
    jobs: jobsWithStatus,
    isLoading: jobsQuery.getJobsPaginatedQuery.isLoading,
    currentPage: jobsQuery.getJobsPaginatedQuery.currentPage,
    totalPages: jobsQuery.getJobsPaginatedQuery.totalPages,
    nextPage: jobsQuery.getJobsPaginatedQuery.nextPage,
    // ... altri props paginazione
  };
};
```

### 4. Uso nella Pagina

```tsx
const { jobs, isLoading, currentPage, totalPages, nextPage, prevPage, handlePageClick } =
  useJobsWithApplicationStatus({ pageSize, defaultPrismaQuery: prismaQuery });

<PaginationWrapperStyled
  data={jobs}
  currentPage={currentPage}
  totalPages={totalPages}
  nextPage={nextPage}
  prevPage={prevPage}
  handlePageClick={handlePageClick}
>
  {({ data }) => /* render list */}
</PaginationWrapperStyled>
```

---

## Service Pattern

```tsx
// @/features/shared/services/entity.service.ts
import { apiClient } from "../api/client";

export const entityService = {
  getAll: async (): Promise<Entity[]> => {
    const response = await apiClient.get<Entity[]>("/entities");
    return response.data;
  },

  create: async (data: CreateEntityDto): Promise<Entity> => {
    const response = await apiClient.post<Entity>("/entities", data);
    return response.data;
  },
};
```

> **⚠️ REGOLA CRITICA**: MAI chiamare i service direttamente nei componenti.
> Wrappare SEMPRE in hook dedicati (`useAuthOperations`, `useJobOperations`, etc.) che gestiscono:
>
> - Mutation state (`isPending`, `error`)
> - Toast automatici (`handleSuccess`, `handleError`)
> - Cache invalidation
>
> Quando serve aggiungere una nuova operazione, **estendere l'hook esistente** invece di crearne uno nuovo.

---

## UI Utilities Pattern

**REGOLA CRITICA**: NON scrivere mai logica di UI helpers (colori, label, icone, etc.) inline nei componenti.
Questa logica DEVE sempre vivere in utility functions dedicate in `{feature}/utils/`.

### Quando Creare UI Utilities

Crea utilities quando hai logica che mappa **dati → UI**:

- Colori per badge/stati (`getStatusColor`)
- Label testuali (`getStatusLabel`)
- Icone condizionali (`getStatusIcon`)
- Classi CSS condizionali (`getRowClassName`)

### Pattern Standard

```tsx
// ❌ SBAGLIATO: Logica inline nel componente
function ApplicationBadge({ status }) {
  let color = "";
  if (status === "NEW") color = "bg-blue-100 text-blue-700...";
  if (status === "HIRED") color = "bg-green-100 text-green-700...";
  // ...

  return <Badge className={color}>{status}</Badge>;
}

// ✅ CORRETTO: Utility separata
// @/features/applications/utils/status.utils.ts
export const getApplicationStatusColor = (status: string): string => {
  switch (status) {
    case "NEW":
      return "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30...";
    case "HIRED":
      return "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50...";
    default:
      return "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800...";
  }
};

export const getApplicationStatusLabel = (status: string): string => {
  switch (status) {
    case "NEW":
      return "Inviata";
    case "HIRED":
      return "Assunto";
    default:
      return "Sconosciuto";
  }
};

// Nel componente
function ApplicationBadge({ status }) {
  return (
    <Badge className={getApplicationStatusColor(status)}>
      {getApplicationStatusLabel(status)}
    </Badge>
  );
}
```

### Organizzazione File

```
{feature}/utils/
├── status.utils.ts       # Status-related helpers (getStatusColor, getStatusLabel)
├── formatting.utils.ts   # Formatters (formatSalary, formatDate)
└── validation.utils.ts   # UI-specific validations
```

### Esempio Reale: Application Status

Vedi [`@/features/applications/utils/status.utils.ts`](file:///Users/tonyscogna/development/learning/practice/web/talent-hive/frontend/src/features/applications/utils/status.utils.ts) come riferimento:

**Per Recruiters** (vedono workflow completo):

```tsx
getApplicationStatusColor(workflowStatus); // NEW → blue, SCREENING → amber, etc.
getApplicationStatusLabel(workflowStatus); // NEW → "Inviata", etc.
```

**Per Candidates** (vedono solo decisione finale):

```tsx
getCandidateDisplayStatus(finalDecision); // null → "In valutazione", HIRED → "Assunto"
getCandidateStatusColor(finalDecision); // null → blue, HIRED → green, REJECTED → red
```

### Regole

1. **Naming**: Usa prefissi semantici (`get`, `is`, `has`, `format`)
2. **Collocazione**: Feature-specific in `{feature}/utils/`, shared in `@/features/shared/utils/`
3. **Dark mode**: SEMPRE includere varianti dark (vedi esempio sopra)
4. **Type safety**: Tipizza input/output dove possibile
5. **Default case**: SEMPRE gestire il fallback con `default` in switch

---

## Shared Components

Controllare SEMPRE `@/features/shared/components/` prima di creare:

- `CustomDialog` - Dialog wrapper
- `PrimaryButton`, `SecondaryButton`
- `Toolbar` - Barre filtri/azioni
- `EmptyState`
- `fields/` - Generic input fields
- `filters/` - Generic filters

---

## Loading Components

Componenti per stati di caricamento con usi specifici:

### Per Suspense (Lazy Loading Routes)

| Componente               | Uso                                        | Location              |
| ------------------------ | ------------------------------------------ | --------------------- |
| `LoadingFallback`        | Full-screen, per auth check e initial load | `routing/components/` |
| `CompactLoadingFallback` | In-content, per lazy route dentro layout   | `routing/components/` |

```tsx
// In AppRoutes.tsx - per lazy loading pagine
<Suspense fallback={<CompactLoadingFallback />}>
  <Outlet />
</Suspense>

// In RoleBasedRouter.tsx - per check auth iniziale
<Suspense fallback={<LoadingFallback />}>
  {routes}
</Suspense>
```

### Per Loading Inline (Dati)

| Componente     | Uso                                                            |
| -------------- | -------------------------------------------------------------- |
| `Spinner`      | Loading generico (varianti: sm/md/lg, default/muted/white)     |
| `InputLoading` | Placeholder per input durante fetch (varianti: default/inline) |

```tsx
// Spinner in lista durante fetch
{isLoading && <Spinner size="lg" showMessage message="Caricamento..." />}

// InputLoading per sostituire input
{isLoadingCities ? (
  <InputLoading message="Caricamento città..." />
) : (
  <CitySelect ... />
)}

// InputLoading inline (dentro un container esistente)
<InputLoading message="Loading..." variant="inline" />
```

---

## Error Handling

```tsx
import { handleError } from "@/features/shared/utils/error.utils";
import { handleSuccess } from "@/features/shared/utils/success.utils";
import { toast } from "sonner"; // NOT Shadcn toast
```

---

## Query Invalidation

**NEVER use `refetch()`**. ALWAYS `queryClient.invalidateQueries({ queryKey })`.

```tsx
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.applications.my });
};
```

---

---

## Utilities & Standards

Segui sempre queste regole per mantenere coerenza nel codice e nella UI.

### 1. Date Formatting

**MAI formattare date a mano** o usare `date.toLocaleDateString()`.
Usa SEMPRE le utility centralizzate in `@/features/shared/utils/date.utils.ts` che sfruttano `date-fns` e la locale corretta.

| Funzione                      | Scopo                                       | Esempio           |
| ----------------------------- | ------------------------------------------- | ----------------- |
| `formatDate(date)`            | Format standard localizzato (PPP)           | "24 gennaio 2024" |
| `getRelativeTimeString(date)` | Tempo relativo                              | "2 giorni fa"     |
| `formatDateForInput(date)`    | Per value di input date                     | "2024-01-24"      |
| `normalizeDate(date)`         | Helper interno per gestire string/Date/null | -                 |

```tsx
import { formatDate } from "@/features/shared/utils/date.utils";

// ✅ CORRETTO
<span>{formatDate(user.createdAt)}</span>

// ❌ SBAGLIATO
<span>{new Date(user.createdAt).toLocaleDateString()}</span>
```

### 2. Pagination Constants

Per le dimensioni della paginazione, usa SEMPRE le costanti da `@/features/pagination/constants/page-sizes.ts`.
Non hardcodare mai numeri come `10` o `25`.

```tsx
import { PAGE_SIZES } from "@/features/pagination";

// ✅ CORRETTO
const pageSize = PAGE_SIZES.DEFAULT_PAGE_SIZE; // 25

// ❌ SBAGLIATO
const pageSize = 10;
```

### 3. Standard Buttons

Usa SEMPRE i wrapper stilizzati invece di `<Button>` raw per azioni principali/secondarie standard.

| Componente        | Uso                                            |
| ----------------- | ---------------------------------------------- |
| `PrimaryButton`   | Azione principale (Salva, Crea, Conferma)      |
| `SecondaryButton` | Azione secondaria/Annulla (Chiudi, Indietro)   |
| `GhostButton`     | Azione terziaria/Link (Dettagli, Info, Inline) |

```tsx
// ✅ CORRETTO
<PrimaryButton onClick={handleSave} text="Salva" />
<SecondaryButton onClick={onClose} text="Annulla" />
<GhostButton onClick={onDetails} text="Dettagli" icon={<Eye />} />
```

---

## API Services

I services in `@/features/shared/services/` seguono pattern specifici per compatibilità con i generici hooks.

### List Services (per usePaginationForGen)

I metodi `listXxx` DEVONO seguire questo pattern:

```typescript
// ✅ CORRETTO - Restituisce AxiosResponse, accetta { body, path }
listApplications: async (options: {
  body: ListApplicationsDto;
  path?: Record<string, unknown>;
}): Promise<AxiosResponse<PaginatedResponse<Application>>> => {
  return await apiClient.post<PaginatedResponse<Application>>(
    "/applications/list",
    options.body,
  );
},
```

```typescript
// ❌ SBAGLIATO - Restituisce .data unwrapped
listApplications: async (query: ListDto): Promise<PaginatedResponse<T>> => {
  const response = await apiClient.post(...);
  return response.data; // MAI fare questo per le list!
},
```

**Regola**: MAI usare `.data` nei metodi list. `usePaginationForGen` si aspetta `AxiosResponse`.

**Riferimento**: Seguire pattern di `jobs.service.ts`.

### Error Handling (per usePaginationForGen)

Tutti gli hooks che usano `usePaginationForGen` DEVONO passare `onError` con `handleError`:

```typescript
// ✅ CORRETTO - L'utente vede toast su errore
const query = usePaginationForGen<Entity>({
  // ...altre props
  onError: (error) =>
    handleError(error, "Errore durante il caricamento di {entity}"),
});
```

```typescript
// ❌ SBAGLIATO - Errore silenzioso, l'utente non sa cosa è successo
const query = usePaginationForGen<Entity>({
  // ...altre props
  // onError mancante!
});
```

**Regola**: MAI omettere `onError` nei list hooks. L'utente deve sempre sapere quando un caricamento fallisce.

---

## Regole NON Applicabili (da lex-nexus)

❌ **Rimosse per TalentHive**:

- Multilingua (`t()`, factory schemas con traduzioni)
- Client auto-generato (`sdk.gen.ts`, `types.gen.ts`, `zod.gen.ts`)
- `bun run generate:heyapi`
- Riferimenti a `@/types/interfaces.ts` auto-generato
