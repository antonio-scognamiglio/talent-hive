# 🗺️ Project Tasks

> **Regola**: L'agente lavora sulla task in `🚀 In Corso`.
>
> 1. Quando l'agente finisce, mette la spunta `[x]` ma **NON sposta** la task.
> 2. L'utente revisiona. Se approva (es: "Spostalo in completate"), l'agente sposta la task in `✅ Completate`.
> 3. Se l'utente chiede modifiche, l'agente toglie la spunta `[ ]` e continua a lavorare.

---

## 🚀 In Corso

## 📋 To-Do (Backlog)

- [ ] **Feature: Candidate Applications List Page**
  - [ ] Creare hook `useApplications` con paginazione e filtri
  - [ ] Creare pagina `CandidateApplicationsPage` con route
  - [ ] Creare componente `ApplicationCard` per lista
  - [ ] Creare modale `ApplicationDetailModal` con dettagli candidatura
  - [ ] Gestire navigazione job (nuova tab)

## ✅ Completate

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
