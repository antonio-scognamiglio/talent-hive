# 🧭 Active Context

> L'agente può MODIFICARE questo file per tracciare lo stato attuale.

---

## Progetto Attuale

**Nome**: TalentHive
**Stato**: In sviluppo attivo

## Ultima Sessione

**Data**: 2026-01-30
**Cosa fatto**:

- ✅ **Recruiter Jobs Page**:
  - Implementata tabella con `CustomTableStyled` e `PaginationWrapperStyled`
  - Aggiunto conteggio candidature (`_count.applications`) via Prisma include
  - Creato tipo `JobWithCount` in `frontend/src/features/jobs/types/job.types.ts`
  - Aggiornati tutti i tipi correlati (dialog, handlers, columns) per type-safety
  - Build completo verificato ✓
- ✅ **Fix Reset Filters**:
  - Risolto bug "Reset filtri" su `RecruiterJobsPage` e `CandidateJobsPage`
  - Implementato pattern "Key-Based Reset" (passando `key={resetKey}` ai filtri)
  - Rimosso `useEffect` sync state (anti-pattern che causava race conditions)
  - Aggiornate direttive `frontend.md` con sezione "React Anti-Patterns & Best Practices"

- ✅ **UX Discussion**: Definito pattern per Job Detail Dialog
  - Pattern "Inline Edit Modal" (consolidato: Notion, Airtable, Trello)
  - Click row → View Dialog → Edit mode (con pulsante Modifica)
  - Trash rimane come quick action sulla tabella

## Task In Corso

_Nessuna task in corso_

## Prossimo Task da Iniziare

_Nessun task pianificato_

**Task Posticipati**:

- **Feature: Job Detail Dialog (Recruiter)**: (Rimandato per prossima sessione)

## Note Importanti

- Il tipo `JobWithCount` è in `frontend/src/features/jobs/types/job.types.ts`
- Backend supporta `_count` in include via `sanitizePrismaQuery`
- Il conteggio candidature è già visibile nella tabella RecruiterJobsPage
