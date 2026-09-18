# 🗺️ Project Tasks

> **Regola**: L'agente lavora sulla task in `🚀 In Corso`.
>
> 1. Quando l'agente finisce, mette la spunta `[x]` ma **NON sposta** la task.
> 2. L'utente revisiona. Se approva (es: "Spostalo in completate"), l'agente sposta la task in `✅ Completate`.
> 3. Se l'utente chiede modifiche, l'agente toglie la spunta `[ ]` e continua a lavorare.

---

## 🚀 In Corso

_Nessuna task in corso — prossimo blocco: **Admin (MVP)** (vedi backlog sotto)._

---

## 📋 Backlog: Admin (MVP)

> **Riferimento**: [`MVP_SPEC.md`](../../MVP_SPEC.md) — sezioni *ADMIN (Super User)*, *Flow 3: Admin User Management*, sidebar e rotte `/admin/users`, `/admin/analytics`.
>
> **Già disponibile oggi (non da rifare)**:
> - Backend RBAC job/application con bypass ADMIN (`job.service`, `application.service`)
> - Admin su `/applications` → riusa `RecruiterApplicationsPage` (visibilità globale candidature)
> - `POST /api/users/list` (lista utenti paginata)
> - `CreateJobDialog` / `CreateJobForm` agnostici (riusabili da admin)
> - Seed admin: `admin@talenthive.com`

### Fase 1 — Admin Jobs (priorità alta)

Sostituire `AdminJobsPage` placeholder con gestione reale di **tutti** gli annunci.

- [ ] **Analisi riuso**: valutare se estrarre logica condivisa da `RecruiterJobsPage` vs pagina dedicata `AdminJobsPage`
- [ ] **Query / hook**: usare `useJobs` con utente ADMIN (nessun filtro `createdById` lato backend)
- [ ] **Tabella**: colonne simili a recruiter + colonna **Creato da** (recruiter owner)
- [ ] **Filtri**: search, status, salary, orderBy (riuso `useJobFilters` o variante admin)
- [ ] **Creazione**: pulsante "Nuovo Annuncio" → riuso `CreateJobDialog` + `createJobMutation`
- [ ] **Dettaglio**: click riga → riuso `JobDetailDialog` con RBAC admin (edit/archive su **qualsiasi** job)
- [ ] **Archiviazione**: conferma esplicita "Archivia" (già allineato su recruiter)
- [ ] **Empty / error states**: `EmptyState`, `ErrorState`, `RefreshButton` / reset filtri
- [ ] **Test manuale**: admin modifica job di un altro recruiter; recruiter non può modificare job altrui

**Definition of done**: admin vede tutti i job (DRAFT/PUBLISHED/ARCHIVED), crea, modifica e archivia qualsiasi annuncio.

---

### Fase 2 — User Management (priorità alta)

Implementare provisioning recruiter come da Flow 3 MVP.

#### Backend

- [ ] **DTO shared**: `CreateUserDto` (email, firstName, lastName, role, password temporanea o generata)
- [ ] **DTO shared**: `UpdateUserDto` (firstName, lastName, role — no self-demotion edge cases da definire)
- [ ] **Service**: `userService.createUser` — solo ADMIN, hash password, role `RECRUITER` | `ADMIN` | `CANDIDATE`?
- [ ] **Service**: `userService.updateUser` — solo ADMIN (cambio ruolo, dati anagrafici)
- [ ] **Service**: soft-disable utente? (MVP spec: `isActive` *future* — decidere se rimandare)
- [ ] **Routes**: `POST /api/users` (create), `PATCH /api/users/:id` (update)
- [ ] **RBAC route**: solo `role === ADMIN` su create/update (list già aperta a RECRUITER+ADMIN — verificare se list va ristretta ad ADMIN only per user management page)
- [ ] **Validazione**: email univoca, password policy minima (8 char, come auth esistente)
- [ ] **Test API**: creare recruiter, aggiornare ruolo, errori 403 per non-admin

#### Frontend

- [ ] **Rotta**: `/admin/users` in `routes.config.tsx` (sidebar ADMIN, `showInSidebar: true`)
- [ ] **Pagina**: `AdminUsersPage` — tabella paginata utenti
- [ ] **Hook**: `useUsers` con `usePaginationForGen` + mutations create/update
- [ ] **Service**: `users.service.ts` — `listUsers`, `createUser`, `updateUser`
- [ ] **Colonne**: email, nome, ruolo (badge), data creazione, azioni
- [ ] **Filtri**: search (email/nome), filtro per `role`
- [ ] **Dialog creazione**: form (email, nome, cognome, ruolo, password) — pattern `CustomDialog` + schema Zod
- [ ] **Dialog modifica**: edit ruolo e anagrafica (no password qui — usa flow settings separato)
- [ ] **Conferme**: azioni sensibili (promozione ad ADMIN, cambio ruolo) con `ConfirmationDialog` se serve
- [ ] **Test manuale**: admin crea recruiter → login con nuovo account funziona

**Definition of done**: admin crea e gestisce utenti recruiter dalla UI; nessun placeholder su User Management.

---

### Fase 3 — Applications Admin (priorità media / verifica)

Gran parte già coperta; checklist di allineamento.

- [ ] **Verifica**: admin su `RecruiterApplicationsPage` vede candidature di **tutti** i job
- [ ] **Verifica**: admin può hire/reject/update status su candidature di job non propri
- [ ] **Verifica**: contatori stats globali (senza filtro job) corretti per ADMIN
- [ ] **Opzionale**: label/copy UI che chiarisca vista "piattaforma" vs "miei annunci" (solo polish)
- [ ] **Opzionale**: link da `AdminJobsPage` → `/applications?jobId=xxx` (come recruiter)

**Definition of done**: nessun gap RBAC lato admin sulle candidature; eventuali fix documentati.

---

### Fase 4 — Polish & documentazione

- [ ] **Spostare in completate** le task recruiter già chiuse (jobs, applications, job create)
- [ ] **Aggiornare** `active_context.md` con stato Admin
- [ ] **Aggiornare** checklist `README.md` (User Management TBD, Application flow, Kanban obsoleti)
- [ ] **Rimuovere/sostituire** placeholder copy in `AdminJobsPage.tsx`

---

### Fuori scope MVP (esplicitamente Future)

Da `MVP_SPEC.md` — **non implementare ora**, solo tracciare:

- [ ] `/admin/analytics` — dashboard metriche (time to hire, funnel, ecc.)
- [ ] Email credenziali recruiter alla creazione
- [ ] Soft delete utenti (`isActive`)
- [ ] Kanban board (sostituito da tabella paginata nel MVP attuale)

---

### Ordine di esecuzione consigliato

```text
1. Fase 1 (Admin Jobs)     → valore immediato, massimo riuso componenti esistenti
2. Fase 2 (User Mgmt)     → requisito distintivo ADMIN nel MVP spec
3. Fase 3 (Applications)  → smoke test / fix puntuali
4. Fase 4 (Polish)        → allineamento docs e cleanup
```

## ✅ Completate

- [x] **Feature: Recruiter Job Creation (Dialog)**
  - [x] `CreateJobSchema` + `toCreateJobDto` con status DRAFT/PUBLISHED
  - [x] `CreateJobForm` + `CreateJobDialog` (bozza / pubblica + InlineConfirmation)
  - [x] Backend: `CreateJobDto.status` opzionale in `job.service`
  - [x] Integrazione in `RecruiterJobsPage` con `useStateDialog`

- [x] **Refactor: Job Archive Semantics (UI)**
  - [x] "Elimina" → "Archivia" in `JobDetailDialog` e colonne tabella
  - [x] Nascondere azione archivia per job già ARCHIVED
  - [x] Messaggi conferma espliciti (soft delete)

- [x] **Docs: Form Submission Patterns**
  - [x] CustomDialog regola #5 (multi-azione, Enter disabilitato)
  - [x] `frontend.md` — albero decisionale form in dialog

- [x] **Feature: Recruiter Applications Management Page**
  - [x] Backend: `GET /api/applications/application-stats`
  - [x] `RecruiterApplicationsPage` + filtri + contatori
  - [x] `ApplicationDetailDialog` (view/edit, hire/reject)
  - [x] Routing `/applications` per RECRUITER (+ ADMIN)

- [x] **Chore: Git History Rewrite**
  - Riscritto author/committer emails con `git filter-branch` usando noreply email
  - Force push su remoto completato.

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
