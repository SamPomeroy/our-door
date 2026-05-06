# Our Door -- MVP Scope

## In Scope (Phase 1, due June 2)
- Corpus ingestion pipeline (markdown + PDF → Chroma vector DB)
- Student chat UI with Socratic responses (never direct answers)
- Post-generation guardrail validator (second LLM call, blocks direct answers)
- Conversation logging (question, response, timestamp, topic) to SQLite
- Admin dashboard showing conversation logs
- Two hardcoded roles: student / admin (no individual user accounts)
- Docker compose (one-command startup for backend + Chroma)
- GitHub Actions CI/CD (lint on push)

## Out of Scope (Phase 1)
- Individual user accounts or registration flow
- Student-specific conversation history across sessions
- Analytics, charts, or data visualizations
- File upload UI for admins to add curriculum
- Multi-cohort support

## Deferred to Phase 2
- Retrieval reranking / MMR diversity
- Hint escalation tiers (Socratic → scaffold → near-answer)
- Student frustration detection and tone shift
- Postgres upgrade (currently SQLite)
- Individual student tracking
