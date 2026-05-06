# our-door — socratic learning bot

RAG-backed chatbot that guides coding cohort students via Socratic method. Never gives answers directly.

## stack

- **backend** — FastAPI, Python 3.11, ChromaDB, OpenAI
- **frontend** — Vite + React
- **ingest** — standalone script to chunk + embed curriculum docs into Chroma

## local dev

### backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API runs at `http://localhost:8000`. Docs at `/docs`.

### frontend

```bash
cd frontend
npm install
npm run dev
```

UI runs at `http://localhost:5173`.

### docker (backend + chromadb)

```bash
OPENAI_API_KEY=sk-... docker compose up
```

### ingest

Drop PDFs or `.md` files into `ingest/corpus/`, then:

```bash
cd ingest
pip install openai chromadb pypdf
python ingest.py
```

## endpoints

| method | path | description |
|--------|------|-------------|
| POST | `/auth/token` | get placeholder token |
| POST | `/chat` | send student message, get socratic response |
| GET | `/logs` | admin: view interaction log |
