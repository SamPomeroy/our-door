# 5–6 Minute Pitch Script

**Product:** Our Door  
**Team:** Three’s Company  

---

## Slide 1 – Problem Framing  
**Andrea (~45 seconds)**

"We're Three's Company, and our MVP is called *Our Door.*

Our Door is built around a simple idea: when students get stuck, they shouldn't have to guess where to go next.

Cohort programs like ours move fast, and they come with a lot of materials.

The problem is that when a student gets stuck, it’s easy to feel overwhelmed and fall behind quickly.

So they usually do one of three things: ask a classmate, Google the answer, or use tools like ChatGPT for a direct answer.

Those can help in the moment, but they don’t always match the curriculum, and they don’t always support real learning.

At the same time, instructors don’t have a clear way to see where students are getting stuck. They see final work, but not the confusion that happened before it.

Our angle is simple: help students get unstuck using the program’s own materials, while helping instructors see patterns of confusion before students fall behind."



---

## Slide 2 – Users + Why It Matters  
**Andrea (~50 seconds)**

"We’re solving this for two users.

The first is the student.

They need a safe place to ask questions — privately.

Because in a cohort setting, a lot of students won’t ask at all if they feel embarrassed. And when they stop asking, they stop learning.

Our Door removes that pressure completely. Students can ask anything about class without feeling exposed.

And instead of just giving answers, we guide them through what we call *three knocks.*

The first knock is a hint.  
The second knock points them to the right part of the curriculum.  
The third knock gives a next step to keep them moving forward.

The door opens because the student understands where to go next — not because we handed them the answer.

The second user is the instructor or admin.

They don’t need to see *who* asked — they need to see *what* students are struggling with.

So Our Door shows patterns: common questions, repeated confusion points, and areas where students need support.

Why this matters is simple: learning isn’t just about getting the right answer — it’s about understanding how to get there.

Our Door supports both sides of that loop: private, guided help for students, and clear, aggregated signals for instructors.

**Transition:**  
"Ricky is going to walk through how the system makes that possible."

---

## Slide 3 – System Architecture  
**Ricky (~40 seconds)**

"On the left side, I handle the curriculum pipeline.

We take curriculum materials — like Canvas content and admin-provided resources — and break them into smaller sections.

Then we convert those sections into a searchable format and store them in a database.

So instead of digging through files, the system can quickly find the most relevant pieces of the curriculum when a student asks a question.

The goal is to take messy content and make it usable."

**Transition:**  
"That searchable curriculum feeds into Sam's part of the system."

---

**Sam (~40 seconds)**

"My part is the core system: the retrieval and response layer.

When a student asks a question, the system looks through the curriculum and pulls the most relevant sections.

Then it uses that to generate a response.

But the key difference is that we don’t give direct answers right away.

Instead, we guide the student using the three-knock system: a hint, a curriculum reference, and a next thinking step.

We also enforce guardrails so everything stays grounded in the curriculum — no made-up answers, and no skipping straight to solutions.

So instead of answering for the student, the system helps them learn."

**Transition:**  
"And Andrea connects that to the user experience."

---

**Andrea (~25 seconds)**

"On the user-facing side, I handle login, role routing, the chat interface, conversation logging, and the admin dashboard.

Users choose a role — student or admin — and get routed to the right experience.

So everything you just heard shows up in a simple, usable interface."

---

## Slide 4 – MVP Scope  
**Sam (~50 seconds)**

"For the MVP, we were very intentional about scope.

What’s in:
- Real curriculum that’s fully searchable  
- A backend ingestion path for course materials  
- A working student chat experience  
- The three-knock guidance system  
- Guardrails on every response  
- Full conversation logging  
- A simple admin dashboard  

We also support two roles — student and admin — and the system runs with a single command using Docker.

What’s out:
- User accounts  
- Advanced analytics dashboards  
- Polished upload tools  
- Multi-cohort support  

The goal wasn’t to build everything.

It was to prove the core system works end-to-end — from curriculum to guided learning to instructor visibility."

**Transition:**  
"And now Andrea will show what that looks like."

---

## Slide 5 – UX Flow / Prototype  
**Andrea (~1 minute)**

"This slide shows our Figma concept.

If you’re a student, you go into a simple chat.

You ask a question — privately — and instead of getting the answer, you get three guided knocks: a hint, a curriculum reference, and a next step.

So you’re not just getting unstuck — you’re learning how to move forward.

If you’re an admin, you see a dashboard.

You can see what students are asking, when they asked it, and what topic it relates to.

So instead of guessing where students are struggling, you can actually see it.

We kept the experience intentionally simple:
one place to ask, one place to look, and everything centered around learning."

**Transition:**  
"The work breaks down cleanly across the team."

---

## Slide 6 – Team Ownership  
**Ricky (~35 seconds)**

"We split this into three clear parts.

I own ingestion — taking curriculum and making it searchable.

Sam owns the core system — retrieval, response logic, and guardrails.

Andrea owns the user experience — frontend, login, logging, and the dashboard.

Each part is independent, but together they form one complete system."

**Transition:**  
"I’ll hand it to Sam to close us out."

---

## Slide 7 – Closing Value  
**Sam (~45 seconds)**

"What this proves is simple.

You can take a large curriculum and turn it into something that actually supports learning.

Students don’t just get answers — they knock.

One knock gives a hint.  
Two knocks give guidance.  
By the third knock, they understand where to go next.

And they can do that privately, without feeling embarrassed to ask.

At the same time, every question becomes a signal.

Instructors don’t have to guess anymore — they can see where students are struggling and step in earlier.

So instead of 'just Google it' or 'just ask someone,'

Our Door gives students a clear place to go —
and gives instructors a clear view of what’s happening.

That’s the value of Our Door."