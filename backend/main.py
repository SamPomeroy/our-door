import os
import sqlite3
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from typing import List

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

SYSTEM_PROMPT = (
    "You are a Socratic tutor for a coding cohort using the Three Knocks model. "
    "Never give direct answers, solutions, or code. "
    "Every response must include exactly three parts in this order:\n"
    "1. Hint: a small nudge toward the relevant concept, framed as a question\n"
    "2. Curriculum reference: point back to a relevant concept, topic, or pattern the student has likely seen\n"
    "3. Next step: a concrete action the student can take to keep moving, without giving the answer\n"
    "Keep each part brief. The student should do the thinking, not you."
)

STRICT_SYSTEM_PROMPT = (
    "You are a strict Socratic tutor using the Three Knocks model. "
    "You absolutely cannot give direct answers, code, or explanations. "
    "Respond with exactly three parts:\n"
    "1. Hint: one guiding question that nudges toward the concept\n"
    "2. Curriculum reference: name a relevant topic or pattern, do not explain it\n"
    "3. Next step: one concrete action the student can take on their own\n"
    "Do not explain anything. Do not write code. Every sentence must guide, not answer."
)

GUARDRAIL_PROMPT = (
    "Does the following response follow the Three Knocks model correctly?\n"
    "Three Knocks = a Hint (guiding question), a Curriculum reference (topic pointer), "
    "and a Next step (concrete action) -- with no direct answers, code, or explanations.\n\n"
    "Reply with only PASS or FAIL.\n"
    "PASS = follows Three Knocks, no direct answers or solutions\n"
    "FAIL = gives a direct answer, contains code, or skips the model entirely\n\n"
    "Response to evaluate:\n{response}"
)


# --- db helpers ---

def init_db() -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS logs (
            id        INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            question  TEXT NOT NULL,
            response  TEXT NOT NULL,
            topic     TEXT NOT NULL
        )
        """
    )
    conn.commit()
    conn.close()


def insert_log(question: str, response: str) -> None:
    conn = sqlite3.connect(DB_PATH)
    conn.execute(
        "INSERT INTO logs (timestamp, question, response, topic) VALUES (?, ?, ?, ?)",
        (
            datetime.now(timezone.utc).isoformat(),
            question,
            response,
            question[:50],
        ),
    )
    conn.commit()
    conn.close()


def fetch_logs() -> list[dict]:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    rows = conn.execute("SELECT * FROM logs ORDER BY id DESC").fetchall()
    conn.close()
    return [dict(r) for r in rows]


# --- rag helpers ---

def embed(text: str) -> list[float]:
    resp = oai.embeddings.create(model="text-embedding-3-small", input=text)
    return resp.data[0].embedding


def query_chroma(embedding: list[float], n: int = 5) -> list[str]:
    try:
        client = chromadb.HttpClient(host="localhost", port=8001)
        collection = client.get_collection("curriculum")
        results = collection.query(query_embeddings=[embedding], n_results=n)
        return results["documents"][0]
    except Exception:
        # chroma not yet populated or unavailable — continue without context
        return []


def call_llm(system: str, user: str) -> str:
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


class ChatResponse(BaseModel):
    response: str


class LogEntry(BaseModel):
    id: int
    timestamp: str
    question: str
    response: str
    topic: str


# --- endpoints ---

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest, role: str = Depends(get_current_role)):
    embedding = embed(req.message)
    chunks = query_chroma(embedding)
    context = "\n\n".join(chunks) if chunks else "No curriculum context available."
    user_prompt = f"Curriculum context:\n{context}\n\nStudent question: {req.message}"

    response = call_llm(SYSTEM_PROMPT, user_prompt)

    if not passes_guardrail(response):
        response = call_llm(STRICT_SYSTEM_PROMPT, user_prompt)

    insert_log(req.message, response)
    return ChatResponse(response=response)


@app.get("/logs", response_model=List[LogEntry])
async def get_logs(role: str = Depends(get_current_role)):
    if role != "admin":
        raise HTTPException(status_code=403, detail="admin only")
    return fetch_logs()
