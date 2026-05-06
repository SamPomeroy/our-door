# Our Door

A Socratic learning chatbot for coding cohort programs. Students ask questions and receive
guided responses that help them think through problems themselves — the system never gives
direct answers. Instructors get a dashboard showing what students are asking and where they're stuck.

Built for AISE 26 Capstone | Columbia University / Justice Through Code

---

## Team

| Member | Component |
|---|---|
| Sam | FastAPI backend, RAG pipeline, guardrail system |
| Ricky | Data ingestion, corpus pipeline, CI/CD |
| Andrea | React frontend, admin dashboard, documentation |

---

## Tech Stack

- **Backend:** FastAPI, Python 3.11
- **LLM:** GPT-4o-mini (OpenAI API)
- **Embeddings:** text-embedding-3-small (OpenAI)
- **Vector DB:** Chroma
- **Auth:** JWT via python-jose (two hardcoded roles: student / admin)
- **Logging:** SQLite
- **Frontend:** React + Vite, Axios
- **Containerization:** Docker + docker-compose
- **CI/CD:** GitHub Actions

---

## Setup

### Prerequisites
- Python 3.11+
- Node 18+
- Docker + docker-compose
- OpenAI API key

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # add your OPENAI_API_KEY
uvicorn main:app --reload
```

API docs at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

App at http://localhost:5173

### Run with Docker

```bash
docker-compose up --build
```

### Ingest Corpus

```bash
cd ingest
pip install -r requirements.txt  # if separate, else use backend venv
python ingest.py                 # loads corpus/ into Chroma
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:
OPENAI_API_KEY=your-key-here
SECRET_KEY=change-this-in-prod

---

## Project Structure
our-door/
backend/       FastAPI app, RAG pipeline, guardrail, auth
frontend/      React app (student chat + admin dashboard)
ingest/        Corpus ingestion script
corpus/        Curriculum markdown files
docs/          Architecture diagram, pitch deck, scope
.github/       GitHub Actions CI

---

## Credentials (dev only)

- Student password: `learn2024`
- Admin password: `teach2024`

---

## MVP Scope

See [docs/SCOPE.md](docs/SCOPE.md)
