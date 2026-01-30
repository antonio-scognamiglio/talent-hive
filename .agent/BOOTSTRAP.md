# 🚀 Agent Framework Bootstrap Guide

> **⚠️ REGOLA PER L'AGENTE**: Questo file serve **SOLO** per inizializzare nuovi progetti da zero.
> Se la cartella `.agent/` esiste già nella root del progetto con i suoi file di configurazione, **IGNORA COMPLETAMENTE QUESTO FILE**.
> Non sovrascrivere mai una struttura esistente usando questo template.

---

Copia e incolla il prompt sottostante in una nuova chat con un AI Agent per inizializzare la struttura di lavoro in un **nuovo progetto Full-Stack**.

---

**Prompt:**

Agisci come un esperto Tech Lead. Il tuo compito è inizializzare il framework di lavoro ".agent" per questo nuovo progetto **Full-Stack**.

Per favore, crea la seguente struttura di directory e file nella root del progetto:

### 1. Struttura Directory

```bash
.agent/
  ├── memory/
  ├── plan/
  ├── rules/
  ├── directives/
  └── workflows/
```

### 2. File Core (Crea questi file con il contenuto specificato)

#### `.agent/rules/ai-framework.md`

```markdown
---
trigger: always_on
description: Entry point per il framework .agent
---

# 🤖 AI Agent Framework

Questo progetto usa un framework di coordinamento. **Consulta sempre questi file:**

| Cartella                           | Scopo                                 |
| ---------------------------------- | ------------------------------------- |
| `.agent/memory/active_context.md`  | Stato corrente della sessione         |
| `.agent/memory/lessons_learned.md` | Errori passati da non ripetere        |
| `.agent/plan/tasks.md`             | Task in corso e backlog               |
| `.agent/directives/`               | Regole tecniche (vedi workflow sotto) |

> **NOTA IMPORTANTE**: Non creare MAI la cartella `.agent/brain` nel repository. Gli artefatti di pensiero (piani, walkthrough) vivono nella memoria dell'agente o vengono promossi a documentazione ufficiale in `.agent/docs` o `docs/`.

**Workflow:**

1. **Inizio**: Leggi `active_context.md` e `tasks.md`
2. **Lavoro**: Consulta la direttiva specifica per il contesto:
   - **Frontend**: `.agent/directives/frontend.md`
   - **Backend**: `.agent/directives/backend.md`
   - **Generale**: `.agent/directives/project_rules.md`
3. **Errori**: Registra in `lessons_learned.md`
4. **Fine**: Aggiorna `active_context.md`
```

#### `.agent/memory/active_context.md`

```markdown
# 🧠 Active Context

> **Stato**: Inizializzazione
> **Data**: (Inserisci data corrente)

## 🎯 Obiettivo Corrente

Inizializzazione del progetto full-stack e setup dell'ambiente di lavoro.

## 📝 Note Sessione

- Framework .agent installato.
- Struttura full-stack pronta.
```

#### `.agent/memory/lessons_learned.md`

```markdown
# 📚 Lessons Learned

Questo file raccoglie errori comuni, soluzioni trovate e decisioni architetturali importanti.

| Data   | Categoria | Errore/Problema | Soluzione/Lezione       |
| ------ | --------- | --------------- | ----------------------- |
| (Oggi) | Setup     | -               | Framework inizializzato |
```

#### `.agent/plan/tasks.md`

```markdown
# 🗺️ Project Tasks

> **Regola**: L'agente lavora sulla task in `🚀 In Corso`.
>
> 1. Quando l'agente finisce, mette la spunta `[x]` ma **NON sposta** la task.
> 2. L'utente revisiona. Se approva, sposta la task in `✅ Completate`.
> 3. Se l'utente chiede modifiche, l'agente toglie la spunta `[ ]` e continua a lavorare.

---

## 🚀 In Corso

- [ ] **Setup Iniziale**
  - [x] Creazione struttura `.agent`
  - [ ] Analisi requisiti

## 📋 To-Do (Backlog)

<!-- Aggiungi qui le prossime task da svolgere -->

## ✅ Completate
```

### 3. Direttive Tecniche (Crea placeholder)

Crea i seguenti file vuoti (o con un titolo) in `.agent/directives/`:

1.  `frontend.md` (Regole per React/Vue/Angular, UI library, state management)
2.  `backend.md` (Regole per Node/Python/Go, API design, DB)
3.  `project_rules.md` (Convenzioni di naming, git, struttura cartelle generale)

---

**Fine del Prompt**
