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

### CustomDialog Props

```tsx
<CustomDialog
  isOpen={isOpen}
  onClose={onClose}
  smartAutoClose={true} // Blocca chiusura se form dirty
  isSafeToAutoClose={!form.formState.isDirty}
  header={{ title: "...", description: "..." }}
>
  {/* Form inside, footer INSIDE form for Enter key */}
</CustomDialog>
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
