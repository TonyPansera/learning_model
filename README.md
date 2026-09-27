# learn

[![video](assets/thumbnail.png)](https://www.youtube.com/watch?v=kzcI5F4tGiU)

An AI learning system for [Claude Code](https://claude.com/claude-code), forked from [amosblomqvist/learn](https://github.com/amosblomqvist/learn) (built for pi, from the video [How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU)) and ported to Claude Code.

The teaching philosophy lives in a skill; subagents verify facts and draw diagrams; a hook mirrors the session into a markdown file you read rendered in Obsidian.

## What's in it

Everything lives in `.claude/`:

- `skills/teach/`: the philosophy and the process (probe, plan, teach). Graded quizzes run through Claude Code's `AskUserQuestion`. The `references/` folder covers pacing (keeping curiosity, challenge and success in balance), practice (fluency and spaced repetition) and application (transfer tasks).
- `skills/review/`: `/review [topic]` runs a spaced-repetition review of the nodes that are due, across all topics.
- `skills/visualize/`: adds a correct, minimal diagram to a lesson when an idea is clearer as a picture.
- `skills/md-log/`, `skills/md-unlog/`: `/md-log <file>` links a markdown file to the session and keeps it updated live. `/md-unlog` stops it.
- `agents/`: `researcher`, `mermaid-maker`, `svg-maker`, the subagents the system delegates to.
- `hooks/md-log.mjs`: the session-to-markdown mirror, driven by hooks in `settings.json`.
- `hooks/quiz-timer.mjs`: times each answer and tells Claude (not you), as a pacing and fluency signal.
- `scripts/viz.mjs`: renders Mermaid and SVG to PNG for the maker subagents.

## Install

From your learning project's root (e.g. your Obsidian vault):

```bash
git clone https://github.com/<you>/learn ~/learn          # once, anywhere
npm install --prefix ~/learn/.claude/scripts              # Mermaid renderer (once)
ln -s ~/learn/.claude .claude                              # in each learning project
```

If the project already has a `.claude/` folder, symlink the pieces instead (`skills`, `agents`, `hooks`, `scripts`, `settings.json`). You can also copy them.

Then run `claude` in that directory.

## Usage

1. Create an empty note in the vault, e.g. `lessons/tcp.md`, and open it in Obsidian.
2. In Claude Code: `/md-log lessons/tcp.md`. This replaces the file's content with the session so far and then keeps adding to it.
3. `/teach how TCP makes a reliable stream out of packets`, or ask anything. The `teach` skill also triggers on its own when you ask for an explanation. It asks how deep you want to go (aware, understand, fluent, apply).
4. At the end of a session (say "let's stop here"), Claude writes two files:
   - `notes/<topic>.md`: a clean course sheet (map, one section per concept, common traps from your own mistakes) plus a short report for each session. This is the file to reread. The `lessons/` log is only the transcript.
   - `progress/<topic>.md`: what you reached on each node, your misconceptions, and when each node is due for review.
5. To learn from your own material (slides, lecture notes, book pages, exercise sheets), put the PDF in the vault, e.g. `sources/`, and name it in the prompt: `/teach sources/lecture-2.pdf, I have an exam on it`. Claude keeps the course's scope and notation and cites slides and pages in the notes.
6. On later days, run `/review` to go over whatever is due, mixed across topics.

Quiz questions appear in the note, with math rendered, before the answer popup opens in the terminal. Read them in Obsidian and pick the matching option number in the terminal.

Diagrams are published to `viz/` in the project and embedded as `![[viz-….png|500]]`.

## Requirements

- Claude Code, Node.js 18+
- Mermaid diagrams: `@mermaid-js/mermaid-cli` (installed by the `npm install` above). It needs a headless Chrome. An installed Chrome or Chromium is used when found. Otherwise, if npm skipped puppeteer's browser download: `npx --prefix ~/learn/.claude/scripts puppeteer browsers install chrome-headless-shell`.
- SVG diagrams: `rsvg-convert` (librsvg) or ImageMagick (`magick`).

## Notes

You can run the system without the render tools. The main session still teaches and the researcher still verifies facts. You only lose the generated visuals.

The teaching skill is written for one learner. Edit `.claude/skills/teach/SKILL.md` to fit how you learn best.
