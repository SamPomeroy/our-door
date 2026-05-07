# Component Ownership

| Component | Owner | Branch | Status |
|---|---|---|---|
| FastAPI backend + JWT auth | Sam | feat/backend-auth | merged |
| RAG pipeline + Chroma retrieval | Sam | feat/rag-pipeline | merged |
| Post-generation guardrail | Sam | feat/rag-pipeline | merged |
| SQLite conversation logging | Sam | feat/backend-auth | merged |
| Data ingestion (ingest.py) | Ricky | feat/ingest-pipeline | merged |
| CI/CD (GitHub Actions lint) | Ricky | feat/ingest-pipeline | merged |
| Student chat UI (StudentChat.jsx) | Andrea | feat/frontend-ui | in progress |
| Admin dashboard (AdminDashboard.jsx) | Andrea | feat/frontend-ui | in progress |
| Docs, README, architecture diagram | Andrea | fix/new-pitch-deck | in progress |

## Notes

- Backend, ingest pipeline, and CI/CD are fully wired as of W32
- Frontend components are W33 deliverables
- Guardrail is a two-layer system: Socratic system prompt + second LLM validator call (PASS/FAIL)
- Auth uses two hardcoded roles: `student` / `admin` (no individual user accounts, per MVP scope)
