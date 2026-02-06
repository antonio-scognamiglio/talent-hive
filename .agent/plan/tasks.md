# 🗺️ Project Tasks

> **Regola**: L'agente lavora sulla task in `🚀 In Corso`.
>
> 1. Quando l'agente finisce, mette la spunta `[x]` ma **NON sposta** la task.
> 2. L'utente revisiona. Se approva (es: "Spostalo in completate"), l'agente sposta la task in `✅ Completate`.
> 3. Se l'utente chiede modifiche, l'agente toglie la spunta `[ ]` e continua a lavorare.

---

## 🚀 In Corso

- [x] **Feature: Recruiter Applications Management Page**

  **Scopo**: Pagina per gestire il workflow delle candidature (cambiare status, visualizzare pipeline).

  **Layout**:
  - Toolbar con filtri:
    - `SearchableSelectPaginated` per Job (opzionale)
    - Dropdown Status
    - Search per nome candidato
  - **Contatori Status** sopra tabella (query separata `/api/applications/application-stats`)
    - Se job selezionato → Contatori per quel job
    - Se nessun job → Contatori globali
  - **Tabella Paginata** (`CustomTableStyled` + `PaginationWrapperStyled`)
    - Colonne: Candidato, Job, Status (dropdown inline), Data, Azioni
    - Click riga → Dialog Dettaglio Candidatura

  **Cambio Status**:
  - Dropdown inline nella tabella O nel dialog
  - Stati finali (HIRED/REJECTED) → Confirmation Dialog (irreversibili)

  **RBAC**:
  - Edit/Delete solo per owner del job o Admin
  - Altri recruiter → Read-only

  **Collegamento da Job Detail Dialog**:
  - Pulsante "Vai alle Candidature" → Naviga a `/applications?jobId=xxx`

  **Sub-tasks**:
  - [x] Backend: Endpoint `GET /api/applications/application-stats` (count per status, filtro jobId opzionale)
  - [x] Frontend: `useApplicationFilters` hook (jobId, status, search)
  - [x] Frontend: `useApplicationStats` hook (query separata per contatori)
  - [x] Frontend: Componente `ApplicationStatusCounters` (badge per ogni status)
  - [x] Frontend: Pagina `RecruiterApplicationsPage` con tabella + contatori
  - [x] Frontend: Dialog Dettaglio Candidatura (view/edit)
  - [x] Frontend: Routing `/applications` per RECRUITER

## ✅ Completate

- [x] **Feature: Job Detail Dialog (Recruiter)**
  - [x] Rimuovere Eye e Pencil dalla colonna azioni
  - [x] Aggiungere `onRowClick` alla tabella
  - [x] JobDetailDialog (VIEW state: badge, stats, desc)
  - [x] JobDetailDialog (EDIT state: form, update logic)
  - [x] Integrazione azioni (Edit, Delete, Save, Cancel)
  - [x] Navigazione Kanban (pulsante presente)

- [x] **Refactoring: UpdateJobForm Type Safety**
  - [x] `NumberInputField` per input numerici safe (con normalizzazione)
  - [x] Schema Zod con union (`number | ""`) + superRefine per validazione
  - [x] TypeScript strictness (no `any`, generic types corretti)

- [x] **BugFix: Reset Filters**
  - Risolto bug "Reset filtri" su `RecruiterJobsPage` e `CandidateJobsPage`
  - Implementato pattern "Key-Based Reset"
  - Rimosso `useEffect` sync anti-pattern

- [x] **Feature: Recruiter Jobs Page**
  - [x] Porting `CustomTable` & Utilities
  - [x] Update `useJobFilters` (add Status support)
  - [x] Implement `RecruiterJobsPage` with Table
  - [x] Aggiunto conteggio candidature (`_count.applications`) in tabella
  - [x] Creato tipo `JobWithCount` per type-safety
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
