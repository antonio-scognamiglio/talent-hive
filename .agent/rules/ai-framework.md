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

- Leggi `active_context.md` per capire dove eravamo.
- Leggi `tasks.md` per vedere cosa c'è da fare.
- Leggi `lessons_learned.md` (ultime 5 entry) per evitare errori recenti.

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

---

---

**Nota sulla Sicurezza**:
L'agente ha il permesso di aggiornare in autonomia **SOLO** i file di memoria (`active_context.md`, `lessons_learned.md`, `tasks.md`) per tenerli sincronizzati con il lavoro svolto.
Per qualsiasi modifica al **codice sorgente** o alla configurazione del progetto, l'agente DEVE seguire il normale ciclo di proposta e approvazione.
