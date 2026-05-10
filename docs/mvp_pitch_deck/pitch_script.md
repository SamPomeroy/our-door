# 5-6 Minute Pitch Script

**Product:** Our Door  
**Team:** Three's Company

---

## Slide 1 - Problem Framing
**Andrea (~45 seconds)**

"We're Three's Company, and our MVP is called *Our Door.*

Our Door is built around a simple idea: when students get stuck, they shouldn't have to guess where to go next.

Cohort programs like ours move fast, and they come with a lot of materials.

The problem is that when a student gets stuck, it's easy to feel overwhelmed, embarrassed, and fall behind quickly.

So they usually do one of three things: ask a classmate, Google the answer, or use tools like ChatGPT for a direct answer.

Those can help in the moment, but they don't always match the curriculum, and they don't always support real learning.

At the same time, instructors don't have a clear way to see where students are getting stuck. They see final work, but not the confusion that happened before it.

Our angle is simple: help students get unstuck using the program's own materials, while helping instructors see patterns of confusion before students fall behind."

---

## Slide 2 - Users + Why It Matters
**Andrea (~1 minute)**

"We're solving this through two people.

The first is Jon.

Jon is a student in a coding cohort. He understands the lecture while it's happening, but later, when he is working alone, he gets stuck on something small like scope or an API error.

He does not want to ask in the group chat because he feels like everyone else already gets it. So he waits, Googles, or asks ChatGPT for the answer.

The problem is that those answers may get him unstuck for the assignment, but they do not always help him understand the concept.

Our Door removes that pressure. Students can ask anything about class without feeling exposed.

And instead of just giving answers, we guide them through what we call *three knocks.*

The first knock is a hint.  
The second knock points them to the right part of the curriculum.  
The third knock gives a next step to keep them moving forward.

But the third knock is not the system giving up. If the student is still stuck, that becomes useful information: the tool can narrow the problem further, point them back to a smaller concept, and create a signal that this may be a moment where instructor support is needed.

The second person is Jane.

Jane is an instructor. Jane sees final submissions and hears a few questions from the loudest students, but she does not always see the quiet confusion building underneath.

Jane does not need to know exactly who asked every question. She needs to know what the class is struggling with.

So Our Door shows patterns: common questions, repeated confusion points, and areas where students may need support.

Why this matters is simple: learning isn't just about getting the right answer. It's about understanding how to get there.

Our Door supports both sides of that loop: private, guided help for students, and clear, aggregated signals for instructors."

**Transition:**  
"Ricky is going to walk through how the system makes that possible."

---

## Slide 3 - System Architecture
**Ricky (~40 seconds)**

"On the left side, I handle the curriculum pipeline.

We take curriculum materials, like Canvas content and admin-provided resources, and break them into smaller sections.

Then we convert those sections into a searchable format and store them in a database.

So instead of digging through files, the system can quickly find the most relevant pieces of the curriculum when a student asks a question.

The goal is to take messy content and make it usable."

**Transition:**  
"That searchable curriculum feeds into Sam's part of the system."

---

**Sam (~50 seconds)**

"My part is the core system: the retrieval and response layer.

When a student asks a question, the system looks through the curriculum and pulls the most relevant sections.

Then it uses that context to generate a response.

But the key difference is that we don't give direct answers right away.

Instead, we guide the student using the three-knock system: a hint, a curriculum reference, and a next thinking step.

We also enforce guardrails in practice. The response is checked to make sure it stays Socratic, stays grounded in the curriculum, and does not skip straight to code or a final answer.

If a response fails that check, the system can regenerate it with stricter instructions.

So instead of answering for the student, the system helps them learn while keeping the experience aligned with the course."

**Transition:**  
"And Andrea connects that to the user experience."

---

**Andrea (~25 seconds)**

"On the user-facing side, I handle login, role routing, the chat interface, conversation logging, and the admin dashboard.

Users choose a role, student or admin, and get routed to the right experience.

So everything you just heard shows up in a simple, usable interface."

---

## Slide 4 - MVP Scope
**Sam (~55 seconds)**

"For the MVP, we were very intentional about scope.

What's in:
- Real curriculum that's fully searchable
- A backend ingestion path for course materials
- A working student chat experience
- The three-knock guidance system
- Guardrails on every response
- Full conversation logging
- A simple admin dashboard

We also support two roles, student and admin, and the system runs with a single command using Docker.

What's out:
- Individual user accounts
- Advanced analytics dashboards
- Polished upload tools
- Multi-cohort support

As we move through Phase 1, the core question is not just, 'Can the bot answer?' It's, 'Can the bot help students think better?'

So the signals we care about are things like: are students asking more questions, are repeated confusion topics becoming visible, and can instructors identify where support is needed earlier?

The goal wasn't to build everything.

It was to prove the core system works end-to-end: from curriculum, to guided learning, to instructor visibility."

**Transition:**  
"And now Andrea will show what that looks like."

---

## Slide 5 - UX Flow / Prototype
**Andrea (~1 minute)**

"This slide shows our Figma concept.

For Jon, the experience starts with a simple chat.

He asks a question privately, and instead of getting the answer, he gets three guided knocks: a hint, a curriculum reference, and a next step.

So he is not just getting unstuck. He is learning how to move forward.

And if Jon is still stuck after that third knock, that is still part of the experience. The system can help him break the problem into a smaller next step, and that repeated confusion becomes a signal for the instructor.

For Jane, the experience is the dashboard.

Jane can see what students are asking, when they asked it, and what topic it relates to.

That means instructors are not just reacting to final submissions. They can see confusion earlier, while there is still time to help.

We kept the experience intentionally simple:
one place to ask, one place to look, and everything centered around learning."

**Transition:**  
"The work breaks down cleanly across the team."

---

## Slide 6 - Team Ownership
**Ricky (~35 seconds)**

"We split this into three clear parts.

I own ingestion: taking curriculum and making it searchable.

Sam owns the core system: retrieval, response logic, and guardrails.

Andrea owns the user experience: frontend, login, logging, and the dashboard.

Each part is independent, but together they form one complete system."

**Transition:**  
"I'll hand it to Sam to close us out."

---

## Slide 7 - Closing Value
**Sam (~50 seconds)**

"What this proves is simple.

You can take a large curriculum and turn it into something that actually supports learning.

Students don't just get answers. They knock.

One knock gives a hint.  
Two knocks give guidance.  
Three knocks give a next step.

And if they are still stuck, that moment does not disappear. It becomes a clearer path for the student and a clearer signal for the instructor.

At the same time, every question becomes part of a learning loop.

Students get private support without feeling embarrassed to ask.

Instructors get a better view of where the class is struggling.

And the system stays grounded through curriculum retrieval and guardrails that keep it from becoming just another answer machine.

So instead of 'just Google it' or 'just ask someone,'

Our Door gives students a clear place to go,
and gives instructors a clear view of what is happening.

That's the value of Our Door."
