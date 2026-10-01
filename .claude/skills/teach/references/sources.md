# Teaching from source material

Sometimes the learner brings the material: lecture slides, a lecture-notes PDF, a few pages of a book, an exercise sheet, a past exam. The teaching method does not change: probe, plan, teach, the two principles, pacing. What changes is where the **scope** and the **notation** come from. The source defines *what* to teach and *in whose words*; this skill still decides *how*.

## Read it first, and identify what kind of source it is

Read the whole relevant part before probing or planning. For a PDF, use `Read` with `pages` (at most 20 pages per call, and required for anything over 10 pages). Read long documents in chunks. Look at figures and equations too, not just the text: in slides especially, the figure often *is* the content.

Then work out what kind of source it is, because each kind needs different work from you:

| Kind | What it looks like | Your main job |
|---|---|---|
| **Slides** | Terse. Results without reasoning, figures carrying the meaning, the lecturer's speech missing. | **Fill the gaps.** Reconstruct the reasoning the slides skip: the motivation, the derivation steps, why each result holds. This is where the "how could I have discovered this?" work matters most. |
| **Lecture notes** | Full prose and derivations, in the author's order. | **Restructure, don't repeat.** The reasoning is mostly there, but in presentation order, which is not always dependency order. Map it onto a dependency graph, find the real roots, and point out where the notes assume something they never stated. |
| **Book pages** | Dense. They refer to earlier chapters, numbered equations and definitions outside the pages given. | **Handle the outside prerequisites.** List what the pages assume from before, probe those strands specifically, and either teach them briefly or flag them as out of scope. Chapter exercises are ready-made practice material. |
| **Exercises / past exams** | Problems, maybe solutions. | **They are the target, not the lesson.** They show what "apply" means for this course: use them to set the target depth and as the model for practice and application tasks. Don't reveal a solution the learner may want to attempt themselves. |

A source can mix kinds, like slides with worked examples, or notes with exercises at the end. Handle each part according to its kind.

## Scope and notation come from the source

- **Scope:** teach what the source covers. Anything else that is needed (prerequisites, missing steps) is marked as an addition, not silently mixed in. Mention what the source deliberately leaves out in the orientation.
- **Notation and conventions:** use the source's symbols, names, sign conventions and definitions, even when other texts differ. The learner will be examined in this notation, and the notes must match it. When the source's convention is unusual, say so once: "Your notes write it this way; many books use this other form. We'll stay with your notes."
- **The source is not automatically right.** If something looks wrong (a typo in an equation, a missing condition, a claim that is false as stated), check it with the `researcher` (look in `verified/<topic-slug>.md` first and record the result there, see `verified.md`), then say so plainly and teach the correct version, pointing to exactly where the source differs. The accuracy rule in `SKILL.md` applies to the source as much as to your own memory.
- **Fill the gaps from verified knowledge.** Missing derivation steps and motivation come from you. Anything you are not certain of goes through the `researcher` first, as always.

## Plan

- **Orientation** says what the source is (e.g. "lecture 2 of the superconductivity course: Ginzburg–Landau theory"), what it covers, what it assumes, and what it leaves out.
- **Build the map from the source's concepts**, with the source's names for them, arranged by dependency, not by page order. When your teaching order differs from the source's order, say why in the approach.
- **Large sources** (a full lecture or chapter) are split into sessions by section. State which part this session covers.

## Cite locations so the learner can go back

In the notes, and when it helps in the lesson, point to where each thing is in the source:

- slides: `slides 12–15`
- lecture notes: `§3.2` or `eq. (3.14)`, using the document's own numbering
- books: the **printed** page number (`p. 142`), not the PDF page index, which usually differs

In `notes/<topic>.md`, make citations clickable with Obsidian's PDF page links, which use the PDF page index: `[[sources/C2 - GL Theory.pdf#page=12|slides 12–15]]`, `[[sources/kittel.pdf#page=158|p. 142]]`.

## Track coverage

Record the source and how much of it is done in the progress file's frontmatter (format in `practice.md`), e.g. `covered: slides 1–18 of 40` or `covered: §3.1–3.3`. The next `/teach` on the topic reads it and continues where the last session stopped. Once the whole source is covered, say so, and suggest `/review` and application work on the course's own exercises.
