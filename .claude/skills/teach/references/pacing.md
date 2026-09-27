# Pacing — managing the emotional tension of learning

Learning runs on a mix of emotions, and the mix is a variable you control. **Curiosity** pulls the learner in. **Frustration**, in the right dose, is the feeling of the brain working at its edge. **Satisfaction** (the click) is the reward that makes the next round worth starting. Get the dose wrong and the session dies either way: too much failure discourages, too little challenge bores. Neither state learns.

You cannot see the learner's face. Read the signals you *do* have, every turn, and adjust the dials.

## Signals

- **Quiz streaks.** The last 3–5 results matter more than the session average. Two misses in a row is a different state from two misses spread over ten questions.
- **`I don't know` rate.** One is honest; a run of them means you are teaching above the edge, or the learner is tired and has stopped trying.
- **Answer time.** The `quiz-timer` hook adds `Answer time: Ns` after every `AskUserQuestion`. It includes reading time, so compare it only with this learner's other answers. Fast-and-right means the node is easy for them; slow-and-right means effortful (fine while learning, not yet fluent); fast-and-wrong usually means guessing or a confident misconception.
- **Notes and free text.** Anything typed in a note or "Other" answer is the richest signal you get. Hedges ("I think…", "no idea tbh") and frustration ("ugh", "still don't get it") are data.
- **Message length and tone.** Replies getting shorter, flatter, or slower across the session is the clearest fatigue signal you have.

## Dials

- **Difficulty** of the next question or step.
- **Hint level**, using the ladder below.
- **Socratic vs expository**: switch to narrating when struggle stops being productive; switch back to Socratic when the learner is fresh and on a roll.
- **Chunk size**: shorter explanations and more frequent checks when attention drops.
- **An easy win**: a question you are confident they will get, placed deliberately to restore momentum. It is a tool, not a cheat. Never use it to hide a real gap.
- **Mode change**: move from quiz to a visual, a story, a real case, or an application task. Novelty restores attention.
- **A break**: suggest stopping at a natural boundary rather than grinding on while fatigued. Always stop on a win (see below).

## Targets by phase

| Phase | Success rate to aim for | Framing |
|---|---|---|
| Probe (1a) | Misses are expected | Say so up front: "I'm hunting for the edge of what you know, so some of these *should* be hard. Misses are the point." |
| Teach (3) | ~70–85% | Hard enough that the click feels earned, easy enough that the learner keeps believing they can get it. |
| Practice | ~85–90% | Fluency is built on success. Too many misses here means the node was never understood: go back to teaching it. |
| Application | Struggle is allowed | Transfer is meant to feel hard. Scaffold it (hint ladder); don't lower the task itself. |

These are rough guides, not laws. The trend over the last few questions matters more than the exact number.

## Rules

- **Frustration cap: 2 misses in a row → step down.** After a second consecutive miss on the same strand or node, never pose a third question at the same level. Drop the difficulty, climb one rung of the hint ladder, or switch to expository. In the probe phase, two consecutive misses already bracket the ceiling. Record it and move to another strand, or give an easy question before returning.
- **Boredom cap: 3 fast correct answers in a row → jump.** Raise the difficulty sharply, or skip ahead in the map. Grinding through material the learner already owns wastes the session and kills curiosity.
- **Every node has an arc: curiosity → struggle → click.**
  - *Curiosity*: open on a gap the learner can feel, such as a puzzle, a paradox, a surprising fact, or "predict what happens if…". Asking for a prediction before the reveal is the cheapest curiosity hook there is.
  - *Struggle*: let the learner work at it (Socratic) long enough to own part of the discovery.
  - *Click*: make the resolution explicit. Name what just collapsed into what ("so these three facts are all one idea: …"). Satisfaction that is named is remembered.
- **End every session on a win.** The last thing the learner does is something they succeed at: a consolidating quiz on a node they just mastered, or a recap of what now connects. That is the feeling they will bring back next time.
- **When unsure, ask, in one line.** "Too easy, about right, or too hard?" as a quick `AskUserQuestion` beats guessing. Don't turn it into a survey, and don't ask more than every few nodes.

## Hint ladder

Climb one rung at a time. Go back down as soon as the learner is moving again.

1. **Nudge**: point at the relevant thing without saying what to do with it. "Look at what happens to the denominator."
2. **Narrower question**: split the step into a smaller one the learner can answer.
3. **Partial reveal**: give the first half of the move and let the learner finish it.
4. **Full walkthrough**: narrate the step (expository), then check it landed with a quiz. A walkthrough is not a failure; leaving the learner stuck is.
