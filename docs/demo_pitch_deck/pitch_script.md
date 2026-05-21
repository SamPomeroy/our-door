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

“Let me show you the student side first.

When the student logs in, they land here, where they can ask what they’re stuck on. We also added sample prompt chips to help students get started if they don’t know how to phrase their question.

I’m going to use this one: ‘How do I debug a FastAPI route without just guessing?’

This is a good example because the student is not asking for the answer. They’re asking to be guided.

Now when I send this, the question goes to our FastAPI backend. The backend retrieves relevant curriculum context from Chroma, sends that context through the LLM, applies our guardrails, and returns a guided response.

So here, this is the first knock. The student gets a hint instead of a direct solution.

Now I’m going to follow up like a student who is still stuck:

‘I’m still stuck — what should I check first?’

This shows the second knock. The assistant keeps the student moving, but it still does not just hand them the answer.

And for the third knock, I’ll ask:

‘Okay, what would be my next step after that?’

So in this one short workflow, you can see the purpose of Our Door. The student gets private help, one guided knock at a time, and the system supports learning instead of replacing it.”

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
