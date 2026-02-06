# 🧭 Active Context

> L'agente può MODIFICARE questo file per tracciare lo stato attuale.

---

## Progetto Attuale

**Nome**: TalentHive
**Stato**: In sviluppo attivo

## Ultima Sessione

**Data**: 2026-02-06
**Cosa fatto**:

- ✅ **Migrazione a Colima & LazyDocker**:
  - Installato Colima, Docker CLI e LazyDocker via brew
  - Configurato Colima per M1 (2CPU, 2GB RAM, VirtioFS, Rosetta)
  - Abbandonato Docker Desktop per prestazioni

- ✅ **Fix Ambiente Locale**:
  - Risolto crash `postgres:latest` downgradando a `postgres:16-alpine` in docker-compose
  - Reset completo volumi Docker (`down -v` + rimozione manuale)
  - Inizializzato DB (Push Schema + Seed)

- ✅ **Job Detail Dialog (Recruiter)** - COMPLETATO:
  - Creato `JobDetailDialog` in `frontend/src/features/jobs/components/dialogs/`
  - Implementato pattern "Inline Edit Modal" con due stati (view/edit)
  - **Stato**: ✅ COMPLETATO
  - **Risultato**: `RecruiterJobsPage` completa, `JobDetailDialog` (View/Edit) funzionale, typings robusti.
  - **Prossimo Step**: Avviare "Feature: Recruiter Applications Management Page" (Kanban/Tabella Candidature)
  - RBAC: Solo owner o admin possono modificare/eliminare
  - Integrato in `RecruiterJobsPage` con `onRowClick` handler
  - Rimossi bottoni Eye/Pencil dalla tabella (solo Trash come quick action)
  - Aggiunto pulsante "Vai alle Candidature" che naviga a `/applications?jobId=xxx`

- ✅ **Feature: Recruiter Applications Management Page** - COMPLETATO:
  - Implementata pagina `RecruiterApplicationsPage` con filtri e tabella paginata
  - Creato `ApplicationDetailDialog` con modalità VIEW/EDIT
  - Implementato workflow completo: cambio status, hire/reject con logiche custom
  - Integrato `ApplicationStatusCounters` per overview rapida
  - **Stato**: ✅ COMPLETATO (in attesa di review)

- ✅ **Automazione Dev Environment**:
  - Aggiunto script `bun run dev` nel root `package.json`
  - Creati script espliciti `engine:colima` e `engine:docker-desktop`
  - Ripulito `docker:up` da logiche implicite

- ✅ **Brainstorming Gestione Candidature**:
  - Deciso: Vista tabella paginata (no Kanban per MVP)
  - Contatori status separati (query `/api/applications/stats`)
  - Filtro job via `SearchableSelectPaginated`
  - Filtro job via `SearchableSelectPaginated`
  - Task aggiunta al backlog

- ✅ **Fix: UpdateJobForm Type Safety**:
  - Adottato pattern "Native Number": Schema usa `z.union([number, ""])`, form usa numeri grezzi
  - Validazione robusta su campi vuoti (impedisce salvataggio `undefined`)
  - `NumberInputField` gestisce la normalizzazione input -> number
  - UX nativa (step, min/max) preservata
  - eliminato codice di conversione superfluo (cast string/number)

## Task In Corso

_Nessuna task in corso_

## Completate Oggi (Non Ancora Spostate)

- [x] **BugFix: Reset Filtri in RecruiterApplicationsPage**
  - Fixed filter reset bug by applying Key-Based Reset pattern
  - Added `resetKey` prop to `JobSearchSelectPaginated` and `WorkflowStatusFilter`
  - Ensures filter components remount and clear their internal state when "Azzera filtri" is clicked
  - Documented pattern in `frontend.md` directives

- [x] **Standardize: Navigation in New Tabs**
  - Replaced `window.open()` with React Router `Link` in `JobDetailDialog` and `ApplicationDetailModal`
  - Standardized pattern: `<Link to="..." target="_blank" rel="noopener noreferrer">`
  - Documented pattern in `frontend.md` with clear rules and examples
  - Maintains React Router benefits (client-side routing, code splitting, shared state)

- [x] **Fix: Button Styling Consistency**
  - Fixed `CandidateApplicationsPage` to use `GhostButton` for "Azzera filtri"
  - Now matches pattern used in `RecruiterApplicationsPage`

- [x] **Cleanup: Removed Unused Badge Hook**
  - Deleted `useSidebarBadgeCount.ts` (always returned 0, no logic implemented)
  - Made `badgeCount` optional in `NavigationItemBadges` and `NavigationItemIndicators`
  - Removed hook import and usage from `NavigationMenu.tsx`
  - Badge components now only render when `badgeCount` is explicitly provided

## Prossimo Task da Iniziare

## Prossimo Task da Iniziare

**ApplicationDetailDialog - Modular Refactor & Smart UX**:

- [ ] **Extract** `ApplicationDetailView.tsx` component (Pure Presentational)
- [ ] **Update** `UpdateApplicationForm.tsx` to expose values (`onValuesChange`) for smart actions
- [ ] **Refactor** `ApplicationDetailDialog.tsx` as Controller:
  - Manage interactions between View/Edit modes
  - Implement **Smart Confirmation Logic** (Hire/Reject with dirty state warning)
  - Unified Footer management
- [ ] **Verify** UX Flows:
  - Edit -> Dirty -> Hire -> Confirm (Should save + hire)
  - View -> Hire -> Confirm (Standard hire)

## Note Importanti

- ✅ **Applications Service**: 5 nuovi metodi implementati (stats, workflow, hire, reject, notes)
- ✅ **useApplicationStats**: Hook per statistiche con filtro jobId opzionale
- ✅ **Job Filter**: `JobSearchSelectPaginated` componente standalone per filtrare per job
- ✅ **useApplicationFilters**: Aggiunto supporto filtro `jobId` con URL sync
- ✅ **ApplicationStatusCounters**: Hook che genera badge text per ContentCard
- ✅ **ApiFunctionForGen**: Tipo corretto - `path` ora opzionale (allineato con pattern usePaginationForGen)
- ✅ TypeScript: Compila senza errori, nessun `as any` cast

**Rendering Applications**: Tabella Paginata (NON kanban) con CustomTableStyled

## Note Importanti

- Il tipo `JobWithCount` è in `frontend/src/features/jobs/types/job.types.ts`
- Backend supporta `_count` in include via `sanitizePrismaQuery`
- `JobDetailDialog` usa `useAuthContext` per verificare RBAC
- Pattern usati: `CustomDialog`, `useStateDialog`, `createJobColumnsConfig`
