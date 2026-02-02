# 🧭 Active Context

> L'agente può MODIFICARE questo file per tracciare lo stato attuale.

---

## Progetto Attuale

**Nome**: TalentHive
**Stato**: In sviluppo attivo

## Ultima Sessione

**Data**: 2026-02-02
**Cosa fatto**:

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

- ✅ **Automazione Dev Environment**:
  - Aggiunto script `bun run dev` nel root `package.json`
  - Lancia Docker, Backend e Frontend in parallelo con `concurrently`

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

## Prossimo Task da Iniziare

**Feature: Recruiter Applications Management Page** (nel backlog)

## Note Importanti

- Il tipo `JobWithCount` è in `frontend/src/features/jobs/types/job.types.ts`
- Backend supporta `_count` in include via `sanitizePrismaQuery`
- `JobDetailDialog` usa `useAuthContext` per verificare RBAC
- Pattern usati: `CustomDialog`, `useStateDialog`, `createJobColumnsConfig`
