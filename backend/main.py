import hashlib
import os
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List, Optional

from dotenv import load_dotenv

load_dotenv()

import chromadb
import openai
from fastapi import Depends, FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from auth import get_current_role, router as auth_router

DB_PATH = "logs.db"

oai = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY", ""))
MOCK_MODE = os.getenv("MOCK_MODE", "false").lower() == "true"

MOCK_RESPONSES = [
    "What have you tried so far? What does the error message tell you?",
    "Have a look at the relevant section in your curriculum notes — does anything there connect to what you're seeing?",
    "Try writing the smallest possible version of this that you can test on its own. What's the first step?",
]

# student-selected knock types — student chooses what kind of help they want
KNOCK_PROMPTS = {
    "hint": (
        "You are a Socratic tutor for a coding cohort. "
        "The student has asked for a hint. "
        "Give only a HINT — one short guiding question that nudges them toward the relevant concept. "
        "Do not give the answer, do not reference curriculum materials, do not suggest a next step. "
        "One question only. Be brief."
    ),
    "curriculum": (
        "You are a Socratic tutor for a coding cohort. "
        "The student has asked for a curriculum reference. "
        "Give only a CURRICULUM REFERENCE — name a specific topic, concept, or pattern from their coursework that is relevant. "
        "Point them back to something they have already learned. Do not explain it, do not give the answer, do not ask a question. "
        "One reference only. Be brief."
    ),
    "next_step": (
        "You are a Socratic tutor for a coding cohort. "
        "The student has asked for a next step. "
        "Give only a NEXT STEP — one concrete action they can take right now to move forward on their own. "
        "Do not give the answer, do not explain the concept. One action only. Be brief."
    ),
}

KNOCK_LABELS = {
    "hint": "Hint",
    "curriculum": "Curriculum reference",
    "next_step": "Next step",
}

STRICT_FALLBACK_PROMPT = (
    "You are a strict Socratic tutor. You must not give direct answers, code, or full explanations. "
    "Ask one guiding question or name one relevant concept or suggest one concrete action. "
    "Nothing more."
)

GUARDRAIL_PROMPT = (
    "Does the following response give a direct answer, working code, or a full explanation to a coding question?\n\n"
    "Reply with only PASS or FAIL.\n"
    "PASS = does not give a direct answer or solution\n"
    "FAIL = gives a direct answer, contains working code, or fully explains how to solve it\n\n"
    "Response to evaluate:\n{response}"
)

# --- db helpers ---


def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS logs (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp  TEXT NOT NULL,
            question   TEXT NOT NULL,
            response   TEXT NOT NULL,
            topic      TEXT NOT NULL,
            knock_type TEXT NOT NULL DEFAULT 'hint',
            helpful    INTEGER
        )
        """
    )
    # migrate existing db if new columns aren't present yet
    for col, definition in [("knock_type", "TEXT NOT NULL DEFAULT 'hint'"), ("helpful", "INTEGER")]:
        try:
            conn.execute(f"ALTER TABLE logs ADD COLUMN {col} {definition}")
        except sqlite3.OperationalError:
            pass
    conn.commit()
    conn.close()


def insert_log(question: str, response: str, knock_type: str) -> int:
    conn = sqlite3.connect(DB_PATH)
    cur = conn.execute(
        "INSERT INTO logs (timestamp, question, response, topic, knock_type) VALUES (?, ?, ?, ?, ?)",
        (datetime.now(timezone.utc).isoformat(), question, response, question[:50], knock_type),
    )
    log_id = cur.lastrowid
    conn.commit()
    conn.close()
    return log_id


def fetch_logs() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM logs ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# --- rag helpers ---

_embed_cache: dict[str, list[float]] = {}


def embed(text: str) -> list[float]:
    key = hashlib.md5(text.encode()).hexdigest()
    if key in _embed_cache:
        return _embed_cache[key]
    if MOCK_MODE:
        result = [0.0] * 1536
    else:
        resp = oai.embeddings.create(model="text-embedding-3-small", input=text)
        result = resp.data[0].embedding
    _embed_cache[key] = result
    return result


def cosine_similarity(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)


def mmr_rerank(
    query_embedding: list[float],
    docs: list[str],
    embeddings: list[list[float]],
    k: int = 5,
    lambda_param: float = 0.6,
) -> list[str]:
    if not docs:
        return []
    selected = []
    remaining = list(range(len(docs)))
    query_sims = [cosine_similarity(query_embedding, emb) for emb in embeddings]
    while len(selected) < k and remaining:
        if not selected:
            best = max(remaining, key=lambda i: query_sims[i])
        else:
            def mmr_score(i: int) -> float:
                redundancy = max(cosine_similarity(embeddings[i], embeddings[j]) for j in selected)
                return lambda_param * query_sims[i] - (1 - lambda_param) * redundancy
            best = max(remaining, key=mmr_score)
        selected.append(best)
        remaining.remove(best)
    return [docs[i] for i in selected]


def query_chroma(embedding: list[float], n: int = 5) -> list[str]:
    try:
        client = chromadb.HttpClient(host="chromadb", port=8001)
        collection = client.get_collection("curriculum")
        candidates = collection.query(
            query_embeddings=[embedding],
            n_results=min(n * 2, 20),
            include=["documents", "embeddings"],
        )
        docs = candidates["documents"][0]
        embeddings = candidates["embeddings"][0]
        return mmr_rerank(embedding, docs, embeddings, k=n)
    except Exception:
        # chroma not yet populated or unavailable — continue without context
        return []


def call_llm(system: str, user: str) -> str:
    if MOCK_MODE:
        import random
        return random.choice(MOCK_RESPONSES)
    resp = oai.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.7,
    )
    return resp.choices[0].message.content.strip()


def passes_guardrail(response: str) -> bool:
    if MOCK_MODE:
        return True  # mock responses are always valid
    verdict = call_llm(
        system="You are a strict classifier. Reply with only PASS or FAIL.",
        user=GUARDRAIL_PROMPT.format(response=response),
    )
    return verdict.strip().upper().startswith("PASS")


# --- app ---

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(title="our-door — socratic learning bot", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")


# --- models ---

class ChatRequest(BaseModel):
    message: str
    knock_type: str = "hint"  # "hint", "curriculum", or "next_step"


class ChatResponse(BaseModel):
    response: str
    knock: str
    log_id: int


class FeedbackRequest(BaseModel):
    log_id: int
    helpful: bool


class LogEntry(BaseModel):
    id: int
    timestamp: str
    question: str
    response: str
    topic: str
    knock_type: str
    helpful: Optional[int]


# --- endpoints ---

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, role: str = Depends(get_current_role)):
    knock_type = req.knock_type if req.knock_type in KNOCK_PROMPTS else "hint"

    embedding = embed(req.message)
    chunks = query_chroma(embedding)
    context = "\n\n".join(chunks) if chunks else "No curriculum context available."
    user_prompt = f"Curriculum context:\n{context}\n\nStudent question: {req.message}"

    response = call_llm(KNOCK_PROMPTS[knock_type], user_prompt)

    if not passes_guardrail(response):
        response = call_llm(STRICT_FALLBACK_PROMPT, user_prompt)

    log_id = insert_log(req.message, response, knock_type)
    return ChatResponse(response=response, knock=KNOCK_LABELS[knock_type], log_id=log_id)


@app.post("/feedback")
async def feedback(req: FeedbackRequest, role: str = Depends(get_current_role)):
    conn = sqlite3.connect(DB_PATH)
    conn.execute("UPDATE logs SET helpful = ? WHERE id = ?", (1 if req.helpful else 0, req.log_id))
    conn.commit()
    conn.close()
    return {"ok": True}


@app.get("/logs", response_model=List[LogEntry])
async def get_logs(role: str = Depends(get_current_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="admin only")
    return fetch_logs()
