# 🗺️ Project Tasks

> **Regola**: L'agente lavora sulla task in `🚀 In Corso`.
>
> 1. Quando l'agente finisce, mette la spunta `[x]` ma **NON sposta** la task.
> 2. L'utente revisiona. Se approva (es: "Spostalo in completate"), l'agente sposta la task in `✅ Completate`.
> 3. Se l'utente chiede modifiche, l'agente toglie la spunta `[ ]` e continua a lavorare.

---

## 🚀 In Corso

- [x] **BugFix: Reset Filters**
  - Risolto bug "Reset filtri" su `RecruiterJobsPage` e `CandidateJobsPage`
  - Implementato pattern "Key-Based Reset"
  - Rimosso `useEffect` sync anti-pattern

## 📋 To-Do (Backlog)

- [ ] **Feature: Job Detail Dialog (Recruiter)**

  **Pattern UX Consolidato**: "Inline Edit Modal" (usato da Notion, Airtable, Trello, Linear, HubSpot)

  **Azioni sulla Tabella Jobs**:
  | Azione | UI | Comportamento |
  |--------|-----|---------------|
  | Click Row | — | Apre Dialog (View → Edit) |
  | 🗑️ Trash | Quick Action | Confirmation Dialog → Archivia |

  _Rimuovere Eye e Pencil dalla tabella. Solo Trash come quick action._

  **Dialog Job (due stati)**:

  **Stato VIEW (default)**:
  - Header: Titolo Job + [X] close
  - Body: Status (badge), Località, Salario, Descrizione (read-only)
  - Footer: `[🗑️ Elimina]  [✏️ Modifica]  [→ Kanban]`
  - Statistiche: "📊 12 candidature" (count già implementato)

  **Stato EDIT (dopo click su Modifica)**:
  - Header: "Modifica Annuncio" + [X] close
  - Body: Form con Status (dropdown), Titolo, Località, Salario, Descrizione (textarea)
  - Footer: `[Annulla]  [💾 Salva]`

  **Comportamenti**:
  - Click row → Apre Dialog in stato VIEW
  - Pulsante "Modifica" → Switcha a stato EDIT (form editabile)
  - Pulsante "Salva" → Chiama updateJob, chiude dialog, torna a tabella
  - Pulsante "Annulla" → Torna a stato VIEW senza salvare
  - Pulsante "Elimina" → Confirmation Dialog → Archivia job
  - Pulsante "Kanban" → Naviga a `/kanban` (gestione workflow candidature)

  **Kanban**:
  - Per MVP: Kanban globale (mostra tutte le candidature di tutti i job)
  - Il filtro per job è un enhancement post-MVP

  **Sub-tasks**:
  - [ ] Rimuovere Eye e Pencil dalla colonna azioni (tenere solo Trash)
  - [ ] Aggiungere `onRowClick` alla tabella
  - [ ] Creare `JobDetailDialog` con stato VIEW
  - [ ] Implementare stato EDIT con form
  - [ ] Integrare azioni (Elimina, Modifica, Salva, Kanban)

## ✅ Completate

- [x] **Feature: Recruiter Jobs Page**
  - [x] Porting `CustomTable` & Utilities
  - [x] Update `useJobFilters` (add Status support)
  - [x] Implement `RecruiterJobsPage` with Table
  - [x] Aggiunto conteggio candidature (`_count.applications`) in tabella
  - [x] Creato tipo `JobWithCount` per type-safety

- [x] **Feature: Candidate Applications List Page**
  - [x] Creare hook `useApplications` con paginazione e filtri
  - [x] Creare pagina `CandidateApplicationsPage` con route
  - [x] Creare componente `ApplicationCard` per lista
  - [x] Creare modale `ApplicationDetailModal` con dettagli candidatura
  - [x] Gestire navigazione job (nuova tab)

- [x] **Refactoring: Centralized Error Handling**
  - Implementato sistema errori custom (`AppError`, `NotFoundError`, `ForbiddenError`, etc.)
  - Creato middleware globale error handler in `backend/src/middlewares/error.middleware.ts`
  - Refactoring completo di Auth, User, Job, Application services e routes
  - Tutti gli errori ora usano le classi custom invece di `throw new Error()`

- [x] **Feature: Cambio Password (Full-Stack)**
  - Backend: Aggiungere metodo `changePassword` in `AuthService`
  - Backend: Esporre endpoint `POST /api/auth/change-password`
  - Frontend: Creare form `ChangePasswordForm` (vecchia, nuova, conferma)
  - Frontend: Integrare chiamata API nel tab "Sicurezza"

- [x] **Feature: Aggiornamento Profilo (Full-Stack)**
  - Backend: Aggiungere endpoint `PUT /api/users/profile` (update firstName, lastName)
  - Frontend: Creare form `ProfileForm`
  - Frontend: Integrare chiamata API nel tab "Profilo"

- [x] **Feature: Preferenze Tema (Frontend)**
  - Frontend: Creare tab "Preferenze"
  - Frontend: Spostare/Replicare toggle Dark/Light mode qui

- [x] **Pagina Settings: Shell (Frontend)**
  - Creata pagina `SettingsPage.tsx` con Tabs (Profilo, Sicurezza, Preferenze)
  - Configurato routing `/settings` con lazy loading
  - Aggiunta icona Settings e visibilità sidebar

- [x] Integrare `UserMenu` nella Topbar
  - Importato componente in `AppRoutes`
  - Passato a `SidebarLayout`
  - Fixati i tipi in `routing.types.ts`
  - Aggiustato padding (px-2) e spaziature (rimosso ml-2)
