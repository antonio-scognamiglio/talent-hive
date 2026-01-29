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
│   └── fields/         # Feature-specific fields
├── hooks/              # useXxx.ts
├── schemas/            # {entity}-schema.ts (Zod only, NO components)
├── services/           # (optional, if not in shared)
├── types/              # UI-only types
├── utils/
├── mappers/
└── index.ts            # Barrel export
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

## Regole NON Applicabili (da lex-nexus)

❌ **Rimosse per TalentHive**:

- Multilingua (`t()`, factory schemas con traduzioni)
- Client auto-generato (`sdk.gen.ts`, `types.gen.ts`, `zod.gen.ts`)
- `bun run generate:heyapi`
- Riferimenti a `@/types/interfaces.ts` auto-generato
