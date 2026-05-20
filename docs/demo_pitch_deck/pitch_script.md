# Our Door Demo Pitch Script

**Target length:** 5 to 7 minutes  
**Demo path:** One workflow only.

---

## 1. Problem + User (~1 min)

"Students in technical learning programs get stuck all the time, but the problem is not just not knowing the answer. It is not knowing where to go next.

They may feel embarrassed to ask in public chat, overwhelmed by messy curriculum, or unsure if they are misunderstanding something small or something bigger.

At the same time, instructors often cannot see patterns of confusion until it is too late.

So Our Door was built for two users: a student who needs private guided help in the moment, and an instructor who needs visibility into where students are getting stuck."

---

## 2. Solution + Why AI (~1 min)

"Our Door is a curriculum-aware Socratic learning assistant.

Instead of giving direct answers, it guides students using our three knocks model:

- Hint
- Curriculum reference
- Next step

AI is the right tool here because it can retrieve relevant curriculum context and generate guided responses in real time, while guardrails help keep responses aligned with our learning philosophy."

---

## 3. Live Demo (~3 min)

This should be one path. Do not show everything.

### Student side

1. Login as student.
2. Ask:

```text
I'm confused about JWT tokens. What are they used for?
```

3. Show the AI response: one knock / guided response.
4. Point out:
   - private student help
   - Socratic guidance
   - curriculum-aware response

### Quick backend explanation

"That question hits our FastAPI backend, retrieves curriculum context from Chroma, generates a guided response through the LLM, passes through guardrails, and returns to the student."

### Admin side

5. Switch to admin.
6. Login as instructor/admin.
7. Show logs dashboard.
8. Say:

"Now instructors can see what students are getting stuck on and when."

---

## 4. MVP Scope (~30 sec)

"For our MVP, we focused on stable core functionality:

- curriculum ingestion into vector search
- student chat
- guided three-knock responses
- admin logging dashboard
- simple role-based login

What we intentionally left out were advanced analytics, individual accounts, and broader multi-cohort support."

---

## 5. Impact (~30 sec)

"Our Door is not just a chatbot.

It is a doorway into understanding.

Students get private guided support without simply being given answers, and instructors gain visibility into confusion patterns they may otherwise miss.

The goal is not just helping students get unstuck. It is helping them learn better."

---

## Failure Scenario

If the demo breaks:

"What you are seeing here is our live frontend flow, but the key architecture is: student question to FastAPI, retrieval from Chroma, guided response through the LLM, guardrails, and a logged response in the admin view. Let me walk you through what would normally happen next."
