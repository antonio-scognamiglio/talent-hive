---
trigger: always_on
glob:
description: Entry point per il framework .agent
---

# 🤖 AI Agent Framework

Questo progetto usa un framework di coordinamento. **Consulta sempre questi file:**

| Cartella                           | Scopo                                 |
| ---------------------------------- | ------------------------------------- |
| `.agent/memory/active_context.md`  | Stato corrente della sessione         |
| `.agent/memory/lessons_learned.md` | Errori passati da non ripetere        |
| `.agent/plan/tasks.md`             | Task in corso e backlog               |
| `.agent/plan/tasks.md`             | Task in corso e backlog               |
| `.agent/directives/`               | Regole tecniche (vedi workflow sotto) |

> **NOTA IMPORTANTE**: Non creare MAI la cartella `.agent/brain` nel repository. Gli artefatti di pensiero (piani, walkthrough) vivono nella memoria dell'agente o vengono promossi a documentazione ufficiale in `.agent/docs` o `docs/`.

## 🧠 Memory Protocol (DETERMINISTIC)

L'agente **DEVE** seguire questo protocollo per mantenere la memoria del progetto coerente.

### 1. Inizio Sessione (BOOT)

**ESEGUIRE SEMPRE PRIMA DI QUALSIASI ALTRA AZIONE:**

1. Leggi `active_context.md` per capire dove eravamo.
2. Leggi `tasks.md` per vedere cosa c'è da fare.
3. **⚠️ CRITICO**: Leggi `lessons_learned.md` (ultime **10** entry) per evitare errori già commessi.

> **NOTA**: Saltare il punto 3 porta a ripetere errori già documentati. È la causa principale di inefficienze nelle sessioni.

### 2. Durante il Lavoro (EXECUTION)

- Usa le direttive specifiche (`frontend.md`, `backend.md` etc.).
- **TRIGGER ERRORE**: Se commetti un errore, ricevi un errore di build/lint, o vieni corretto dall'utente:
  1. Correggi l'errore.
  2. **SUBITO DOPO**: Aggiorna `lessons_learned.md` con il pattern "Contesto -> Errore -> Correzione".

### 3. Completamento Task (CHECKPOINT)

- Quando completi un item principale di `tasks.md`:
  1. **VERIFICA PRIMA**: Esegui `tsc --noEmit` o equivalente per controllare errori.
  2. **VERIFICA DIRETTIVE**: Rileggi le direttive rilevanti (`frontend.md`, `backend.md`) e confronta il codice scritto con i pattern documentati:
     - Hook usati correttamente (`useStateDialog`, `useCallback`, `useMemo`)
     - Component patterns seguiti (`CustomDialog`, `Toolbar`, `ContentCard`)
     - Error handling pattern rispettato (`onError` + `handleError`)
  3. Aggiorna `active_context.md` (Sezione "Cosa fatto").
  4. Aggiorna `tasks.md` (Spunta l'item).
  5. **MAI** dichiarare "fatto" prima di aver verificato che il codice compila E segue le direttive.

### 4. Fine Interazione (SHUTDOWN)

- **PRIMA** di chiedere feedback all'utente (`notify_user` finale):
  1. Aggiorna `active_context.md` con lo stato corrente.
  2. Assicurati che `lessons_learned.md` contenga eventuali nuove regole scoperte.

### 5. Regole per i Commit (Conventional Commits)

- Il progetto usa `husky`, `commitizen` e `commitlint` per garantire che i messaggi di commit rispettino lo standard **Conventional Commits**.
- **LINGUA OBBLIGATORIA**: I messaggi di commit e le descrizioni DEVONO rigorosamente essere scritti in **Inglese**. Non ci devono essere assolutamente commit in italiano.
- Quando viene richiesto all'agente di eseguire l'accesso a Git e completare un commit per conto dell'utente, l'agente **DEVE** generare messaggi conformi allo standard (es. `feat(jobs): add status filter`, `fix(ui): resolve padding issue`, `build(git): configure husky rules`).
- **Tipi ammessi**: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.
- Se esegui il commit tramite terminale, ricorda che `lint-staged` formatterà il codice (ESLint) e controllerà la tipizzazione (TypeScript `tsc --noEmit`) passivamente.

---

---

**Nota sulla Sicurezza**:
L'agente ha il permesso di aggiornare in autonomia **SOLO** i file di memoria (`active_context.md`, `lessons_learned.md`, `tasks.md`) per tenerli sincronizzati con il lavoro svolto.
Per qualsiasi modifica al **codice sorgente** o alla configurazione del progetto, l'agente DEVE seguire il normale ciclo di proposta e approvazione.
