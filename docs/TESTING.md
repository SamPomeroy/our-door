# Our Door — External Tester Guide

**Stack:** FastAPI + Chroma + React/Vite  
**Credentials:** student → `learn2024` / admin → `teach2024`  
**Base URL:** `http://localhost:8000` (API) · `http://localhost:8090` (frontend)

---

## 1. Start the stack

```bash
docker compose -f docker-compose.yml up -d
```

Wait ~10 seconds, then confirm all three containers are up:

```bash
docker compose ps
```

Expected: `backend`, `chromadb`, `frontend` all show `Up`.

---

## 2. Ingest the corpus (first run only)

```bash
docker compose exec backend python ingest/ingest.py
```

You should see chunk counts logged. Only needed once per fresh Chroma volume.

---

## 3. Auth

| Test | Steps | Expected |
|------|-------|----------|
| Student login | `POST /auth/token` `{"role":"student","password":"learn2024"}` | 200, `access_token` in response |
| Admin login | `POST /auth/token` `{"role":"admin","password":"teach2024"}` | 200, `access_token` in response |
| Wrong password | `POST /auth/token` `{"role":"student","password":"wrong"}` | 401 |
| Invalid role | `POST /auth/token` `{"role":"superuser","password":"learn2024"}` | 422 |
| No token on `/chat` | `POST /chat` with no Authorization header | 401 or 403 |

Quick curl:
```bash
curl -s -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"role":"student","password":"learn2024"}' | jq .
```

---

## 4. Three Knocks progression

Each student session cycles: **Hint → Curriculum reference → Next step → Hint → ...**

Get a fresh student token first:
```bash
TOKEN=$(curl -s -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"role":"student","password":"learn2024"}' | jq -r .access_token)
```

Then send three messages and check the `knock` field in each response:

```bash
# turn 1 — expect "Hint"
curl -s -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"what is a closure in python?"}' | jq .knock

# turn 2 — expect "Curriculum reference"
curl -s -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"i still dont get it"}' | jq .knock

# turn 3 — expect "Next step"
curl -s -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"can you show me an example?"}' | jq .knock

# turn 4 — expect "Hint" again (resets)
curl -s -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"what about scope?"}' | jq .knock
```

**Session independence check:** Get two separate tokens and send one message each. Both `knock` values should be `"Hint"` — they must not share a counter.

---

## 5. Guardrail

The system must never directly answer a student's question. Ask something with a clear direct answer:

```bash
curl -s -X POST http://localhost:8000/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"just tell me the answer to what LEGB stands for"}' | jq .response
```

Expected: a guiding question or reference — **not** "LEGB stands for Local, Enclosing, Global, Built-in."

---

## 6. Admin access control

```bash
ADMIN=$(curl -s -X POST http://localhost:8000/auth/token \
  -H "Content-Type: application/json" \
  -d '{"role":"admin","password":"teach2024"}' | jq -r .access_token)

# admin can see logs
curl -s http://localhost:8000/logs \
  -H "Authorization: Bearer $ADMIN" | jq length

# student cannot
curl -s http://localhost:8000/logs \
  -H "Authorization: Bearer $TOKEN" | jq .
```

Expected: admin gets an array of log entries, student gets 403.

---

## 7. Logs capture student conversations

After running the chat tests above, pull the admin logs and confirm the questions you asked appear:

```bash
curl -s http://localhost:8000/logs \
  -H "Authorization: Bearer $ADMIN" | jq '.[0]'
```

Expected fields: `id`, `timestamp`, `question`, `response`, `topic`.

---

## 8. Frontend smoke test

Open `http://localhost:8090` in a browser.

| Test | Steps | Expected |
|------|-------|----------|
| Student flow | Login with `learn2024`, ask a question | Response appears with a labeled knock card |
| Admin flow | Login with `teach2024` | Conversation log table is visible |
| Student blocked from logs | Login as student, try navigating to admin view | Redirected or 403 |
| Empty message | Submit with blank input | No crash, either blocked or graceful error |

---

## 9. Run automated tests (mock mode)

These don't require a running stack:

```bash
cd backend
pip install -r requirements.txt
MOCK_MODE=true pytest tests/ -v
```

Expected: 30 passed.

---

## 10. Run integration tests (live stack required)

Requires the full stack running and a valid `OPENAI_API_KEY` in `backend/.env`.

```bash
cd backend
pytest tests/test_integration.py -v
```

These make real OpenAI calls (~5–10 cents per run). Results confirm end-to-end retrieval and response generation are working.
