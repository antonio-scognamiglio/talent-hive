# 🧭 Active Context

> L'agente può MODIFICARE questo file per tracciare lo stato attuale.

---

## Progetto Attuale

**Nome**: TalentHive
**Stato**: In sviluppo attivo

## Ultima Sessione

**Data**: 2026-01-30
**Cosa fatto**:

- ✅ **Candidate Applications**:
  - Architettura Hook: `useApplications` (filtri + paginazione).
  - UI Components: `ApplicationCard` (Refactored con standard UI).
  - Page: `CandidateApplicationsPage` con pattern corretto.
  - Route: `/applications` per CANDIDATE in sidebar.
  - Guidelines: Hard Rules per stili deterministici e utilities date/page-sizes.

## Task In Corso

**Features Candidate** → Implementazione `ApplicationDetailModal` e `CandidateApplicationsPage`.

## Prossimi Passi

- [ ] Completare UI Applications (Modal, Page, Route)
- [ ] Push dei commit
- [ ] Monitoraggio bug dopo il deploy/push

## Note Importanti

- Il backend ora risponde sempre con `{ message: "..." }` in caso di errore.
- `.agent/BOOTSTRAP.md` è il punto di partenza per nuovi progetti full-stack con questo framework.
