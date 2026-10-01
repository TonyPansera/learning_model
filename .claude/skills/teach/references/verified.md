# Verified facts — the `researcher`'s memory

The `researcher` subagent has no memory: every call starts in an empty context and searches the web from scratch. `verified/<topic-slug>.md` is the memory it lacks. It stores every fact that a `researcher` has already checked, with its sources, so a later session reuses the result instead of paying for the same search again, and so a fact is never taught one way in one session and another way in the next.

The `researcher` only has `WebSearch` and `WebFetch`, so it cannot write this file. **You write it**, from the brief the `researcher` returns.

## When to read it

- **At the start of Phase 1 on a returning topic**, together with `progress/<topic-slug>.md` and `notes/<topic-slug>.md`. If `verified/<topic-slug>.md` does not exist yet, skip it.
- **Before every `researcher` call**, whether it is the Phase 2 field scan or a single fact check. Look for the fact in the file first (search for the symbol, name or keyword).

## How to reuse an entry

- A `confirmed` or `corrected` entry that answers the question exactly: use it, and do not call the `researcher`. If it matters to the lesson, mention that it was verified and where.
- An entry that only partly covers the question: call the `researcher` for the missing part only, and say in the task description what is already settled.
- An entry marked `open`, or one that conflicts with what a source or the learner says: call the `researcher` again, and update the entry with the new result.
- Never treat an entry as proof against the learner's source material. If the source disagrees with an entry, re-check, then record the outcome.

## When to write it

**Immediately after each `researcher` call**, not at the end of the session. A session that stops early must not lose what was verified. Add one entry per fact the brief settled, plus one `field scan` entry per Phase 2 scan.

The learner's own corrections count too. If the learner or their source corrects a fact and a `researcher` call confirms it, record it as `corrected`.

## File format

```markdown
---
topic: <same title as the progress file>
updated: YYYY-MM-DD
---

## Field scan

- YYYY-MM-DD · <what was scanned, e.g. "London theory, core concepts and gotchas">
  - <short finding> — [Source title](url)
  - <short finding> — [Source title](url)

## Facts

### <short name of the fact, e.g. "Flux quantum in a superconductor">

- **Status:** confirmed | corrected | open
- **Claim:** <the fact as it will be taught, with LaTeX for math: $\Phi_0 = hc/2e$>
- **Sources:** [Source title](url), [Source title](url)
- **Checked:** YYYY-MM-DD
- **Note:** <only when status is `corrected` (what the wrong version was, and where it came from) or `open` (what could not be settled)>
```

Status meanings:

- `confirmed`: sources agree with what was about to be taught.
- `corrected`: the check changed what was about to be taught. Always fill `Note` with the wrong version, so the trap is on record. If it is a trap the learner fell into, it also belongs in the progress file's errors column and in the notes' **Common traps**.
- `open`: the `researcher` could not settle it (sources disagree, or none found). Do not teach it as an unconditional truth. Say so to the learner.

## Rules

- **One fact per entry, one claim per fact.** Short enough to find with a search.
- **Keep the sources.** An entry without a URL is not verified; do not write it.
- **Use the course's notation and conventions** (units, signs) in `Claim`, as `sources.md` requires, and say so in `Note` if another convention is common.
- **Update, do not duplicate.** If the fact already has an entry, edit it in place and refresh `Checked` and `updated`.
- **Do not store lesson content here.** Explanations, framings and derivations belong in `notes/`. This file holds only checked facts and where they come from.
