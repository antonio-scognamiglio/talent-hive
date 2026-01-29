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
| `.agent/directives/`               | Regole tecniche (vedi workflow sotto) |

**Workflow:**

1. **Inizio**: Leggi `active_context.md` e `tasks.md`
2. **Lavoro**: Consulta la direttiva specifica per il contesto:
   - **Frontend**: `directives/frontend.md` + `directives/ui_guidelines.md`
   - **Backend**: `directives/backend.md`
   - **Monorepo/Shared Types**: `directives/monorepo.md`
3. **Errori**: Registra in `lessons_learned.md`
4. **Fine**: Aggiorna `active_context.md`
