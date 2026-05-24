# Our Door — Phase 2 Plan

## Features

### Feature 1: Student frustration detection
When a student asks the same or semantically similar question multiple times in a session,
the system detects the pattern and shifts from Hint mode to a more scaffolded response —
closer to a worked example without giving a direct answer. Targets students who are stuck,
not just cycling through the knock progression.

### Feature 2: Retrieval reranking
Replace the current top-5 Chroma results with a reranking pass (MMR or cross-encoder)
so repeated or similar queries return diverse chunks instead of the same hits every time.
Improves response quality as the corpus grows.

## Improvement Area

UX — both features address places where the system currently fails the student. Frustration
detection responds to the student's actual state, not just their turn count. Better retrieval
means more relevant responses, which students feel immediately.

## Rough Timeline

| Week | Goal |
|------|------|
| W37 | Frustration detection: session similarity scoring, tone-shift prompt |
| W38 | Retrieval reranking: MMR implementation, A/B comparison against current |
| W39 | Integration, edge case testing, corpus expansion |
| W40 | Final polish, evaluation write-up, MVP showcase prep |
