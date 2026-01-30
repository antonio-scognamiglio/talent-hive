# 📝 Lessons Learned

> L'agente può APPENDERE a questo file quando impara da correzioni.

---

## Format

Ogni lezione segue questo formato:

### [DATA] - [Titolo Breve]

**Contesto**: Cosa stavo facendo
**Errore**: Cosa ho sbagliato
**Correzione**: Cosa fare invece
**Regola aggiornata**: (se proposto aggiornamento a directive)

---

<!-- Le lezioni verranno aggiunte qui sotto -->

### 2026-01-29 - Lazy Loading in Route Config

**Contesto**: Aggiunta della pagina `SettingsPage` in `routes.config.tsx`.
**Errore**: Ho definito il componente lazy inline (`element: lazy(() => import(...))`).
**Correzione**: Definire sempre i componenti lazy come costanti in cima al file per pulizia e coerenza (`const SettingsPage = lazy(...)` e poi `element: SettingsPage`).

### 2026-01-29 - Tabs UI Responsiveness

**Contesto**: Creazione layout a Tab in `SettingsPage`.
**Errore**: Uso di `max-w-[200px]` e `justify-start` che lasciava spazio vuoto a destra.
**Correzione**: Usare `flex-1` sui trigger e rimuovere vincoli di larghezza per far riempire tutto lo spazio disponibile (`w-full`).

### 2026-01-29 - Sidebar Visibility Default

**Contesto**: Creazione nuova pagina "Account/Settings".
**Errore**: Impostato `hidden: true` perché accessibile dal UserMenu.
**Correzione**: Preferire il doppio collegamento (Sidebar + UserMenu) usando `showInSidebar: true` e un'icona appropriata, salvo casi eccezionali.

### 2026-01-29 - PageContent Wrapper

**Contesto**: Creazione nuova pagina `SettingsPage`.
**Errore**: Non ho usato i componenti `<PageContent>` e `<PageHeader>` per wrappare il contenuto.
**Correzione**: Tutte le pagine devono seguire la struttura di `CandidateJobsPage.tsx`: wrappare in `<PageContent>` e usare `<PageHeader>` per titolo/sottotitolo.

### 2026-01-29 - Schema Zod Separati

**Contesto**: Creazione form cambio password.
**Errore**: Ho definito lo schema Zod inline nel componente.
**Correzione**: Gli schema vanno in file separati: `features/{feature}/schemas/{name}.schema.ts` (vedi `login.schema.ts`, `register.schema.ts`).

### 2026-01-29 - Forms in Cartella Dedicata

**Contesto**: Creazione `ChangePasswordForm`.
**Errore**: Ho messo il form in `features/user/components/`.
**Correzione**: I form vanno in `features/{feature}/components/forms/` (vedi `features/applications/components/forms/`).

### 2026-01-29 - Hook per Operazioni API

**Contesto**: Chiamata API per cambio password.
**Errore**: Ho chiamato `authService.changePassword()` direttamente dal componente.
**Correzione**: Usare sempre `handleViewCv` da `useMyApplications`, aggiungere `onError` a tutti i list hooks con `handleError` per toast.

### 2026-01-30 - useStateDialog per Modali

**Contesto**: Implementazione modale dettaglio applications.
**Errore**: Usato useState manuale per gestire stato modale invece di `useStateDialog` hook.
**Correzione**: Usare sempre `useStateDialog<T>(["view", "edit", ...])` per gestire apertura/chiusura modali. Pattern: `dialog.openDialog(item, "view")`, `dialog.isDialogOpen("view")`, `dialog.closeDialog()`.zioni API. Mai chiamare service direttamente.

### 2026-01-29 - Dialog Pattern per Azioni

**Contesto**: Implementazione cambio password.
**Errore**: Ho messo il form inline nel tab, occupando spazio permanentemente.
**Correzione**: Usare- **Dialog**: Quando si usa `CustomDialog` con form, usare pattern `smartAutoClose` + `onDirtyChange` (vedi `ChangePasswordDialog`).

- **Vite Monorepo**: Usa sempre `path.resolve` per gli alias in `vite.config.ts` (es: `@shared: path.resolve(__dirname, "../shared")`) per evitare errori di risoluzione.
- **Refactoring Utils**: Quando si rinominano funzioni di utility (es. `getJobStatusBadgeClasses` -> `getJobStatusVariant`), cercare sempre tutte le occorrenze nel progetto (`grep`) prima di confermare, per evitare rotture in componenti non toccati direttamente.
- **UI Patterns**: Per le tabelle, usare sempre il pattern `Toolbar` (per azioni/filtri) + `ContentCard` (wrapper per la tabella). Non rimuovere la Toolbar pensando che ContentCard la sostituisca. Vedi `SupportTickets.tsx` come reference.

### 2026-01-29 - useDialog Hook

**Contesto**: Gestione stato del dialog.
**Errore**: Gestito stato con `useState` manualmente.
**Correzione**: Usare l'hook `useDialog` esistente in `features/shared/hooks/useDialog.ts` per la variante stateless.

### 2026-01-29 - Estendere Hook Esistenti

**Contesto**: Necessità di hook per cambio password.
**Errore**: Creato nuovo hook `useChangePassword.ts` separato.
**Correzione**: Aggiungere le mutation agli hook esistenti (`useAuthOperations`) invece di creare nuovi hook. Centralizzare le operazioni per dominio.

### 2026-01-29 - Vite Monorepo & Shared Types

**Contesto**: Sviluppo in monorepo con cartella `shared` fuori dal root del frontend.
**Errore**: `vite.config.ts` usava alias relativi (`../shared`) e mancava `index.ts` in `shared/types/dto`.
**Correzione**:

1. Usare sempre `path.resolve(__dirname, "../shared")` per gli alias in `vite.config.ts`.
2. Assicurarsi che ogni sottocartella condivisa (es. `dto`) abbia un `index.ts` che esporta tutto.

### 2026-01-29 - CustomDialog Component

**Contesto**: Creazione dialog per cambio password.
**Errore**: Usato `Dialog` di shadcn/ui direttamente.
**Correzione**: Usare sempre `CustomDialog` da `features/shared/components/CustomDialog.tsx` che gestisce header, footer, scroll e chiusura intelligente.

### 2026-01-29 - Settings Edit Pattern

**Contesto**: Implementazione Settings Page.
**Errore**: Ho creato form di modifica inline nella pagina.
**Correzione**: Seguire SEMPRE il pattern **Read-Only View + Edit Dialog**. La pagina mostra i dati attuali, il bottone "Modifica" apre un Dialog con il form (vedi `ProfileBasicInfoSection` in `lex-nexus-fe`).

### 2026-01-29 - Componenti Field Precotti

**Contesto**: Creazione form con campi password.
**Errore**: Ricreato manualmente la logica del toggle visibilità password.
**Correzione**: Usare i componenti precotti in `features/shared/components/fields/`:

- `FileUploadField` - per upload file

### 2026-01-30 - Inline Styles Vietati

**Contesto**: Implementazione `ApplicationCard` con bordo colorato dinamico.
**Errore**: Usato `style={{ borderLeftColor: ... }}` con logica condizionale inline.
**Correzione**: **HARD RULE**: Mai usare `style` inline. Usare utility Semantic (es. `getCandidateIndicatorColor` che restituisce classi Tailwind `bg-blue-500`) e `cn()`.

### 2026-01-30 - Fragile Style Derivation

**Contesto**: Derivazione colore bordo da classe background string (`bg-blue-100`).
**Errore**: Usato `.replace("bg-", "border-")` sulla stringa della classe. Fragile e non deterministico.
**Correzione**: Creare sempre helper espliciti (switch case) che mappano lo Stato -> Classe finale desiderata (es. `getCandidateIndicatorColor`).

### 2026-01-30 - UI Constants & Utilities

**Contesto**: Paginazione e date in `ApplicationCard` e `useApplications`.
**Errore**: Hardcoded `pageSize = 10` e formattazione manuale data.
**Correzione**:

1. Usare SEMPRE `PAGE_SIZES` da constants.
2. Usare SEMPRE `formatDate` da `date.utils.ts`.
3. Inserite regole in `frontend.md`.

### 2026-01-30 - Verifica Prima di Dichiarare Fatto

**Contesto**: Implementazione `CandidateApplicationsPage` e configurazione routing.
**Errore**: Dichiarato "fatto" senza verificare che il codice compilasse. Props errate e route non aggiunta.
**Correzione**: **SEMPRE** eseguire `tsc --noEmit` (o verificare lint/build) PRIMA di chiamare `notify_user` con PathsToReview. Aggiornato `ai-framework.md` con regola esplicita.

### 2026-01-30 - Services Return AxiosResponse (Non .data)

**Contesto**: Fix errore 500 su `/api/applications/list`.
**Errore**: `listApplications` restituiva `response.data` (unwrapped) invece del raw `AxiosResponse`.
**Correzione**: I services usati con `usePaginationForGen` DEVONO sempre restituire `return await apiClient.post(...)` (NO `.data`). Seguire pattern di `jobs.service.ts`.

### 2026-01-30 - onError Obbligatorio nei List Hooks

**Contesto**: Nessun toast mostrato su errore 500 durante fetch applications.
**Errore**: `useApplications` non passava `onError` a `usePaginationForGen`, errori silenziosi.
**Correzione**: SEMPRE passare `onError: (error) => handleError(error, "Messaggio errore")` a `usePaginationForGen`. L'utente deve vedere toast su ogni errore di caricamento lista.

### 2026-01-30 - Logo Theme Awareness

**Contesto**: Rendering del logo in modalità Light/Dark.
**Errore**: `Logo` aveva un default statico (`variant="dark"`) che caricava l'icona bianca, invisibile su sfondo bianco (default app).
**Correzione**: Implementata logica "smart" in `Logo.tsx` usando `useTheme`. Se `variant` non è passata, rileva il tema corrente e sceglie l'icona opposta (sfondo chiaro -> icona scura, e viceversa). Rimuovere default statici pericolosi.

### 2026-01-30 - Width Fissi nei Filtri Vietati

**Contesto**: Styling dei filtri in `Toolbar` (`JobStatusFilter`).
**Errore**: Usato `w-[200px]` nel componente e nella pagina, violando direttive frontend.
**Correzione**:

1. Componente interno (`SelectTrigger`) -> Sempre `w-full`.
2. Componente esterno (`Toolbar`) -> Usare `flex-X min-w-XX` per responsiveness (es. `flex-1 min-w-40`).

### 2026-01-30 - Spread Props in PaginationWrapper

**Contesto**: Refactoring `RecruiterJobsPage` per usare `CustomTableStyled`.
**Errore**: Destrutturato props esplicitamente (`{ data: jobs, isLoading, ...paginationProps }`) e aggiunto `onRowClick` non richiesto dall'utente.
**Correzione**: Usare SEMPRE `{(props) => <CustomTableStyled {...props} columns={columns} emptyState={customEmptyState} />}`. Non aggiungere props non richieste.

### 2026-01-30 - Non consultato lessons_learned.md

**Contesto**: Inizio lavoro su nuova feature.
**Errore**: Non ho letto `lessons_learned.md` prima di iniziare, ripetendo errori già documentati.
**Correzione**: All'inizio di ogni sessione o task, leggere **SEMPRE** le ultime 10 entry di `lessons_learned.md` per evitare errori ricorrenti.

### 2026-01-30 - React Sync State Anti-Pattern (useEffect vs Key)

**Contesto**: Debugging del reset filtri ("Azzera filtri" button).
**Errore**: `useEffect` usato per sincronizzare Input state ↔ URL. Causava race condition dove l'effetto ripristinava vecchi valori prima che l'URL fosse aggiornato, e re-render loop/blinking.
**Correzione**:

1. Rimuovere `useEffect` di sincronizzazione.
2. Usare **Key-Based Reset**: Parent passa `key={resetKey}` ai filtri.
3. Reset incrementa `resetKey` → React rimonta i componenti → Stato riparte pulito (`useState` inizializza con valori fresh).
   **Regola Agente**: "Se puoi evitare un useEffect, evitalo." (Aggiunto a `frontend.md`).
