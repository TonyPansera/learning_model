# Practice — from understood to fluent

Understanding makes a fact derivable. Practice makes it **available**: fast, automatic, usable without re-deriving it every time. A learner who has to rebuild the whole graph to answer a basic question understands but is not fluent, and slow recall blocks everything built on top.

Practice never replaces understanding. Only practice nodes that went through the teach loop and landed. Drilling a node that isn't understood just memorizes it, which is exactly what this system exists to avoid. If practice keeps failing on a node, stop drilling and teach it again.

## Formats

Use a mix of these. Variety is itself a signal of mastery: a node the learner can only recall in one format is not solid.

- **Mixed retrieval.** Quiz several nodes in random order rather than one node many times in a row. Mixing forces the learner to recognise *which* idea applies, which is the skill used in real problems. Blocked repetition feels smoother but transfers worse.
- **Produce it.** Ask for free-text recall instead of recognition: "State the definition", "Write the formula", "Sketch the three steps". Grade it against the node's core claim and name exactly what was missing. Producing is harder than picking, so it counts for more.
- **Faded examples.** Show a fully worked example, then the same kind of problem with the last step blanked, then with half blanked, then solved alone. Each fade moves more of the work to the learner.
- **Variation.** Same idea, different surface: other numbers, another context, the question asked in reverse. It checks that the learner holds the idea, not the example.

All graded questions use the `quiz` protocol in `SKILL.md`, or free text that you grade immediately in the same ✓ / ✗ format.

## Fluency and speed

Use the `Answer time: Ns` the `quiz-timer` hook adds after every `AskUserQuestion`.

- **Fast and correct**: fluent. Space it out further.
- **Slow and correct**: understood but effortful. Not yet fluent: bring it back later in the session, with variation.
- **Wrong**: not practice material yet. Go back to the teach loop for that node.

Judge speed relative to this learner and this kind of question, never an absolute number. Never show the time to the learner or turn practice into a race; the pressure costs more than it gains.

## Spacing

Memory that is retrieved just as it starts to fade gets stronger than memory that is repeated while fresh. Track each practised node in a Leitner box:

| Box | Review again after |
|---|---|
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 | 16 days |
| 5 | 35 days |

- A correct recall moves the node up one box (box 5 stays at 5).
- A miss sends it back to box 1, and the error goes in the progress file.
- A slow but correct recall stays in its box.

The `/review` skill runs these reviews across sessions.

## The progress file

One file per topic: `progress/<topic-slug>.md` at the project root, where `<topic-slug>` is short kebab-case (e.g. `tcp`, `fourier-series`). It is the only memory that survives between sessions. Keep it human-readable, because the learner reads it in Obsidian too.

```markdown
---
topic: TCP reliable delivery
goal: understand how TCP builds a reliable stream from unreliable packets
target: fluent
updated: 2026-09-27
sources:                                   # only when learning from a file (see sources.md)
  - file: sources/tcp-lecture.pdf
    kind: slides                           # slides | notes | book | exercises
    covered: slides 1–18 of 40
---

| node | target | reached | box | last | due | errors / misconceptions |
|---|---|---|---|---|---|---|
| packets can be lost or reordered | understand | understand | – | 2026-09-27 | – | |
| sequence numbers | fluent | fluent | 2 | 2026-09-27 | 2026-09-30 | confused seq with ack number once |
| retransmission timeout | apply | understand | 1 | 2026-09-27 | 2026-09-28 | |
```

- **`target`** and **`reached`** take the values `aware`, `understand`, `fluent` or `apply`. `reached` only moves up when there is evidence: a correct quiz for understand, fast correct mixed recall for fluent, a solved transfer task for apply.
- **`last`** is the date the node was last worked on. **`box` and `due`** are filled only for nodes in spaced practice (`target` fluent or apply, and `reached` at least understand); otherwise use `–`. Dates are ISO (`YYYY-MM-DD`). `due` = `last` + the box interval.
- **Errors / misconceptions** record *which* wrong idea showed up, not just that a miss happened. They are what the next session probes first.
- **Node names** match the labels on the dependency map, so a later session can rebuild the map from the file.
- Update `updated` on every write. Edit rows in place; never duplicate a node.
