---
name: review
description: Run a spaced-repetition review of everything the learner has studied — pulls the nodes that are due from progress/*.md, quizzes them mixed across topics, and updates the schedule. Use when the user asks to review, revise, or practice what they learned before, or runs /review [topic].
argument-hint: "[topic]"
---

# Review

Spaced review keeps understood nodes available: each node comes back just as it starts to fade, and every successful recall pushes the next one further out. This skill runs one review session over the progress files written by the `teach` skill.

Before starting, read these (paths from the project root):

- `.claude/skills/teach/SKILL.md`, the sections **The `quiz` protocol** and **Writing quiz options**. Every review question follows them exactly.
- `.claude/skills/teach/references/pacing.md`. Pacing rules apply here too.
- `.claude/skills/teach/references/practice.md`. It holds the retrieval formats, the Leitner intervals and the progress file format.

## 1. Collect what is due

- Read `progress/*.md`, or only `progress/<topic>.md` if a topic was given (`$ARGUMENTS`).
- A node is **due** when its `due` date is today or earlier. Today's date is in your context.
- If nothing is due, say so, name the next due date, and offer either an early review of the lowest-box nodes or a new teach session. Stop there.
- If more than about 15 nodes are due, take the most overdue first and leave the rest for another session. A review that drags on stops working.

## 2. Run the review

- **Mix topics and nodes.** Never review one topic in a block. Interleaving is what makes the recall useful.
- **Vary the format** per `practice.md`: recognition quizzes, "produce it" free-text recall, a variation of the original problem. Don't re-ask the exact question from last time; recall of a question is not recall of the idea.
- **Start with a probe of the recorded misconceptions** in the errors column. Those are the most likely to come back.
- **Grade every answer immediately** (✓ / ✗ and the explanation), as in the quiz protocol.
- **Pacing:** reviews should feel mostly successful (about 85–90%). After two misses on the same topic in a row, stop reviewing that topic and briefly re-teach the missed node with the teach loop (motivate → establish → connect → quiz-check) before moving on. A node that fails review was never fully understood, or has faded; either way, drilling it harder won't fix it.
- **Use answer times.** The `Answer time: Ns` after each question separates fluent (fast, correct) from effortful (slow, correct).

## 3. Update the progress files

For every reviewed node, edit its row in place:

- **Correct and fast:** move up one box (box 5 stays at 5).
- **Correct but slow:** stay in the same box.
- **Miss:** back to box 1, and record the specific wrong idea in the errors column.
- Set `last` to today and `due` to `last` + the box interval. Update `reached` only when there is evidence (see `practice.md`), and update `updated` in the frontmatter.

## 4. Close

- **End on a win**: a final question on a node the learner just recalled well.
- Give a short summary: how many nodes were reviewed, which moved up, which dropped back and why, and when the next review is due.
- If a node dropped back to box 1 twice, suggest a short `teach` session on it rather than more review.
- For each topic reviewed, add a `· Review` entry to the session reports of `notes/<topic>.md`, and add any new misconception to its **Common traps** (format in `.claude/skills/teach/references/notes.md`). If the notes file doesn't exist, skip this; only `teach` creates it.
