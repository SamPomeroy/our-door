# Our Door -- Freeze Rules
_AISE Capstone / Hackathon 3 | Defined W33_

---

## In MVP
Features the team commits to delivering by June 2:

- Student chat UI -- ask a question, receive a Socratic response (bot responds with guiding questions, not direct answers)
- RAG pipeline -- real JTC/AISE curriculum corpus ingested, chunked, embedded, and queryable (ChromaDB + OpenAI embeddings)
- Guardrail system -- two layers enforced on every response: system prompt + post-generation validator
- Conversation logging -- question, response, timestamp stored in SQLite
- Admin view -- table of logged conversations (timestamp, question, topic, response summary)
- JWT auth -- two hardcoded roles (student / admin), no registration flow
- Docker Compose -- one command spins up the full stack
- GitHub Actions CI -- pytest runs on every push

---

## Out of MVP
Features explicitly removed or deferred to Phase 2:

- Individual user accounts / registration
- Student-specific conversation history
- Analytics, charts, or visualizations
- File upload UI for admins (corpus changes require a re-ingest script, not a UI)
- Multi-cohort support
- Any UI polish beyond functional screens

---

## The Freeze Rule

> **No new features will be added between implementation complete and demo day.**

If it isn't in the "In MVP" list above, it doesn't ship. If someone asks for it during build, the answer is "Phase 2." This file is the source of truth.

---

## Signed

- Sam Pomeroy
- Andrea Churchwell
- Ricky ___________

_Freeze rule is binding. Fellows on this team can point to this file when blocking late additions._
