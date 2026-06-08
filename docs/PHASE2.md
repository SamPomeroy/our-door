# Our Door — Phase 2 Plan

## Features

### Feature 1: Corpus metadata + file upload
Store source metadata (filename, topic, chunk index) with every chunk at ingest time.
Add an admin UI for uploading PDF and CSV files so instructors can expand the corpus
without touching the codebase. Uploaded files are chunked, embedded, and pushed to
Chroma with full metadata. Fixes the broken `topic` field in conversation logs.

### Feature 2: Student-selected response type + feedback
Replace the automatic Three Knocks turn counter with explicit student choice.
After submitting a question, the student selects the kind of help they want:
Hint, Curriculum Reference, or Next Step. After receiving a response, they can
rate it with a thumbs up or thumbs down. Feedback is stored and surfaced in the
admin dashboard. Eliminates the topic-switching problem with the current progression
and gives instructors a measurable signal on response quality.

### Feature 3: Retrieval reranking
Replace the current top-5 Chroma results with an MMR reranking pass so repeated
or topic-shifted queries return diverse chunks instead of the same hits every time.
Improves response quality as the corpus grows.

## Improvement Area

UX and evaluation — student-selected response type removes the mismatch between
what a student needs and what the system delivers. Thumbs up/down feedback creates
a measurable helpfulness rate per response type, giving instructors a real signal
on where the system is working and where it isn't.

## Timeline

| Dates | Goal |
|-------|------|
| Jun 8–11  | Metadata at ingest (Ricky); knock redesign backend (Sam) |
| Jun 11–15 | File upload backend + UI (Sam + Andrea); knock UI (Andrea) |
| Jun 15–18 | Retrieval reranking (Sam); integration + feedback dashboard |
| Jun 18–21 | Polish, edge cases, showcase prep |
