# Application — from knowing to using

A node is only fully owned when the learner can use it somewhere it was never taught: a new context, a messy real case, a problem that doesn't announce which idea it needs. That is **transfer**, and it doesn't happen on its own. Understanding and fluency make it possible; only application tasks train it. They also give perspective: seeing where an idea works, where it breaks, and why that matters.

Application comes after understanding. Give transfer tasks only for nodes that have landed (a correct quiz-check). A transfer task on a shaky node just produces frustration with no learning.

## Task types

Pick the one that fits the node and the goal. Rotate between them across a topic.

- **Transfer problem.** Same underlying idea, a surface the learner hasn't seen. After TCP retransmission: "A walkie-talkie protocol has no acknowledgements. What goes wrong, and what is the smallest fix?" Don't name the idea to use; recognising it is half the task.
- **Real case.** Real data, a real system, a real historical event, a real bug report. Ask the learner to explain it with the graph they just built. Real cases are messy on purpose: part of the skill is ignoring what doesn't matter. Verify any real-world facts with the `researcher` first, as for anything else you teach.
- **Debug a wrong explanation.** Write a short, plausible explanation with exactly **one** planted error (a wrong direction, a swapped cause, a missing condition) and ask the learner to find and fix it. It exercises the same skill as reviewing someone else's reasoning, and it surfaces misconceptions the learner didn't know they had. Tell them there is exactly one error.
- **Estimate (Fermi).** "Roughly how many… / how long… / how big…?" The learner reasons from the model to an order of magnitude. What counts is the chain of reasoning, not the number.
- **Teach-back.** The learner explains the node in their own words, as if to a friend who knows the roots but not this node. Grade it against the node's core claims: which claims are present and correct, which are missing, which are distorted. Name each one. A good teach-back is the strongest evidence of understanding there is.
- **Take-away exercise.** A small task to do outside the session: build it, try it, observe it, measure it. Log it in the progress file (errors column: "exercise: …") and ask how it went at the start of the next session.

## Running an application task

1. **State the task clearly, not the method.** The learner has to choose which part of the graph applies.
2. **Let the learner struggle.** Transfer is supposed to be hard. Use the hint ladder in `pacing.md` one rung at a time rather than lowering the task.
3. **Grade and connect.** Say what was right, what was missing, and, most important, which node from the map the solution rested on. Making that edge explicit is what makes the next transfer easier.
4. **Record it.** A solved transfer task moves `reached` to `apply` in the progress file. A failed one records which node didn't transfer.
