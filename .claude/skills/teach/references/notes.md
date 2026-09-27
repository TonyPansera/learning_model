# Notes — the course sheet and session reports

The md-log file is a transcript: every detour, question and correction, in conversation order. It is the right record of *how* the learning happened, and a poor thing to reread. The notes file is the opposite: a clean course sheet the learner can open later and reread in ten minutes to rebuild the whole graph, plus a short report for every session.

One file per topic: `notes/<topic-slug>.md` at the project root, with the same slug as `progress/<topic-slug>.md`. Create it at the end of the first session on a topic, and update it at the end of every later session. It grows into the full course over time.

## Rules

- **Write only what was actually taught and confirmed.** The notes consolidate the session; they are not a place to add new material. A node whose quiz-check failed goes in as "in progress", with what is still unclear, not as settled fact.
- **Rewrite, don't paste.** Turn the conversation into clean prose in teaching order, the way a good course would present it. Keep the motivation and the "how could I have discovered this" reasoning, because that is what makes it understandable on a reread. Drop the back-and-forth.
- **Update in place.** On later sessions, extend or correct the existing node sections and add new ones in map order. Never duplicate a node, and never append a second copy of the course.
- **Match the map.** Node headings use the same labels as the dependency map and the progress file.
- **LaTeX for math, embeds for diagrams.** Reuse the `viz-….png` files published during the lesson (`![[viz-….png|500]]`); don't create new diagrams just for the notes.

## Format

```markdown
---
topic: TCP reliable delivery
updated: 2026-09-27
sessions: 1
---

# TCP reliable delivery

> Progress: [[progress/tcp]] · Session logs: [[lessons/tcp]] · Source: [[sources/tcp-lecture.pdf]] (slides 1–18 of 40)

**Goal:** understand how TCP builds a reliable stream from unreliable packets.

## Map

(the current dependency map, as a mermaid graph with depth labels)

## Course

### 1. Packets can be lost or reordered
The unconditional truth, stated plainly. Why it holds. What it is needed for.

### 2. Sequence numbers · fluent
Motivation → how you could have discovered it → the idea → how it hangs off node 1.
Key formula or rule, a diagram embed if there was one.

### 3. Retransmission timeout · in progress
What is established so far, and what is still unclear.

## Common traps

- **Sequence number vs acknowledgement number**: the misconception in one line → the correct view in one line.

## Session reports

### 2026-09-27 · Lesson
- **Covered:** nodes 1–3.
- **Quizzes:** 11/14 correct in teaching (level check not counted).
- **Clicked:** why numbering makes ordering *and* loss detection one mechanism.
- **Struggled with:** telling seq from ack numbers (two misses, fixed with a diagram).
- **Next:** first review due 2026-09-28 (`/review`); next node: congestion window.
```

- **Links:** link the progress file, and every md-log note used for this topic (the `/md-log <path>` command earlier in the session shows the path). Add a new log note to the links line rather than replacing the old one.
- **Common traps** come only from mistakes the learner actually made, each stated as misconception → correction. They are the most valuable part of the sheet for revision.
- **Session reports** go newest last. Keep each one short, and be honest about struggles: the report is for the learner's own tracking, not a certificate. For a `/review` session, the heading is `· Review` and the lines are the nodes reviewed, how many moved up or dropped back, and the next due date.
