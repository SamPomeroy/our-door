from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List

from auth import router as auth_router

app = FastAPI(title="our-door — socratic learning bot")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/auth")


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str


class LogEntry(BaseModel):
    timestamp: str
    question: str
    response: str
    topic: str


@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # TODO: retrieve relevant chunks from chroma, build socratic prompt, call openai
    return ChatResponse(response="What do YOU think the first step might be?")


@app.get("/logs", response_model=List[LogEntry])
async def get_logs():
    return [
        LogEntry(
            timestamp="2026-05-05T09:00:00",
            question="How do I reverse a string in Python?",
            response="What do YOU think the first step might be?",
            topic="strings",
        ),
        LogEntry(
            timestamp="2026-05-05T10:15:00",
            question="What is recursion?",
            response="What do YOU think the first step might be?",
            topic="recursion",
        ),
    ]
