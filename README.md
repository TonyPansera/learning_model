# learn

[![video](assets/thumbnail.png)](https://www.youtube.com/watch?v=kzcI5F4tGiU)

A personal AI tutor that runs in [Claude Code](https://claude.com/claude-code). You learn in the terminal, and read the lesson in [Obsidian](https://obsidian.md): math, diagrams and quizzes are all rendered there, live.

It is a fork of [amosblomqvist/learn](https://github.com/amosblomqvist/learn) (from the video [How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU)), originally built for the pi agent. This version is ported to Claude Code and extended with pacing, practice, spaced review, course notes and learning from your own PDFs.

---

## Contents

1. [How it teaches](#how-it-teaches)
2. [What's in the repo](#whats-in-the-repo)
3. [Requirements](#requirements)
4. [Installation](#installation)
5. [Your first lesson](#your-first-lesson)
6. [During a lesson](#during-a-lesson)
7. [Ending a lesson](#ending-a-lesson)
8. [Learning from your own material](#learning-from-your-own-material)
9. [Reviewing](#reviewing)
10. [Files it creates](#files-it-creates)
11. [Command reference](#command-reference)
12. [Troubleshooting](#troubleshooting)
13. [Customizing](#customizing)

---

## How it teaches

The goal is **understanding, not memorizing**. Knowledge that hangs together as a dependency graph (a few solid foundations, everything else derived from them) sticks; isolated facts fade. Every lesson builds that graph:

- **Unconditional truths first.** Each topic starts from a few facts you can accept at face value, with no caveats, and everything else is built on top of them.
- **"How could I have discovered this?"** Every step is motivated, so nothing feels arbitrary. Where you can work something out yourself, Claude asks you to try before revealing it.

A lesson has three phases:

1. **Probe.** Quiz questions to find exactly where your knowledge stops, plus questions about your goal and how deep you want to go.
2. **Plan.** Claude shows an orientation, its approach, and a dependency map of the lesson, then waits for your go-ahead.
3. **Teach.** One concept at a time: a hook (puzzle or prediction), the reasoning, how it connects to what you know, and a check question.

It covers the **four aspects of learning** as far as your goal needs:

| Aspect | What it means | How it's covered |
|---|---|---|
| Awareness | Knowing what exists and where it fits | An orientation before each plan |
| Understanding | A working mental model | The teaching loop above |
| Practice | Fast, reliable recall | Mixed drills, answer timing, spaced review |
| Application | Using it in new situations | Transfer problems, real cases, finding a planted error, explaining it back |

It also manages **pacing**. It aims for about 80% success, eases off after two misses in a row, speeds up when things are too easy, opens each concept on a puzzle, and always ends on a win.

Facts are checked by a researcher agent before they are taught, whenever there is any doubt. The researcher has no memory of its own, so every fact it checks is saved with its sources in `verified/<topic>.md`. Later sessions look there first and only search the web for what is missing, so a fact is checked once and taught the same way every time.

---

## What's in the repo

Everything that runs lives in `.claude/`, which you link into your vault:

```
.claude/
├── skills/
│   ├── teach/              the teaching method (SKILL.md) + references/
│   │   └── references/     pacing, practice, application, notes, sources, verified
│   ├── review/             /review: spaced-repetition sessions
│   ├── visualize/          adds a verified diagram when a picture helps
│   ├── md-log/             /md-log: mirror the session into a note
│   └── md-unlog/           /md-unlog: stop mirroring
├── agents/
│   ├── researcher.md       verifies facts, maps topics (web search)
│   ├── mermaid-maker.md    draws flow and graph diagrams, checks them visually
│   └── svg-maker.md        draws geometric and spatial figures, checks them visually
├── hooks/
│   ├── md-log.mjs          writes the lesson into your Obsidian note
│   └── quiz-timer.mjs      times your answers (seen by Claude only)
├── scripts/viz.mjs         renders Mermaid / SVG to PNG
└── settings.json           hook wiring + permissions
```

---

## Requirements

| Needed for | Requirement |
|---|---|
| Everything | [Claude Code](https://claude.com/claude-code) and [Node.js](https://nodejs.org) 18 or newer |
| Reading lessons | [Obsidian](https://obsidian.md) (free). No plugins needed. |
| Flow and graph diagrams | `@mermaid-js/mermaid-cli`, installed below, plus a headless Chrome |
| Geometric diagrams | `rsvg-convert` (librsvg) or ImageMagick (`magick`) |
| Web research | Claude Code's built-in WebSearch / WebFetch |

The diagram tools are optional. Without them, everything works except the generated pictures.

---

## Installation

### 1. Get the repo and install the renderer (once)

```bash
git clone https://github.com/TonyPansera/learning_model.git
npm install --prefix ~/learn/.claude/scripts
```

If npm skipped puppeteer's browser download (it prints a warning about install scripts), install the headless browser yourself:

```bash
npx --prefix ~/learn/.claude/scripts puppeteer browsers install chrome-headless-shell
```

For SVG diagrams, install one of these:

```bash
sudo apt install librsvg2-bin      # Debian / Ubuntu / WSL
brew install librsvg               # macOS
```

ImageMagick works too, as a fallback.

### 2. Create a vault in Obsidian (once)

A vault is just a folder that Obsidian displays.

1. Open Obsidian and click **Create new vault**.
2. Name it (e.g. `learning`), choose where it goes, and click **Create**.
3. In the sidebar, create a folder named `lessons`.

### 3. Link the system into the vault (once per vault)

```bash
cd /path/to/your/vault
ln -s ~/learn/.claude .claude
```

Because this is a link, any change you make in `~/learn` applies to every vault instantly. Obsidian ignores folders whose names start with a dot, so `.claude` stays invisible in your notes.

If the vault already has a `.claude/` folder, link the pieces instead (`skills`, `agents`, `hooks`, `scripts`, `settings.json`), or copy them.

> **Windows + WSL:** keep the vault on the Windows side so Obsidian can open it, and run Claude Code from WSL. For a vault at `C:\Users\you\Documents\learning`:
> ```bash
> cd /mnt/c/Users/you/Documents/learning
> ln -s ~/learn/.claude .claude
> ```

### 4. First launch

```bash
cd /path/to/your/vault
claude
```

When Claude Code asks whether you trust the folder, answer **yes**. Otherwise the hooks (the lesson mirror and the answer timer) will not run.

### 5. Check that everything loaded

In Claude Code:

- Type `/`. The list should include `teach`, `review`, `md-log` and `md-unlog`.
- Run `/agents`. It should list `researcher`, `mermaid-maker` and `svg-maker`.
- Run `/hooks`. It should show `md-log.mjs` and `quiz-timer.mjs`.

---

## Your first lesson

1. **In Obsidian**, right-click `lessons` → **New note**, and name it after the topic, e.g. `tcp`.
2. **Arrange your screen**: terminal on one half, Obsidian on the other. Open the note and press **Ctrl+E** (Cmd+E on Mac) to switch to reading view, where math and diagrams render.
3. **In Claude Code**, link the note to the session:
   ```
   /md-log lessons/tcp.md
   ```
   ⚠️ This **replaces** the note's content with the session so far. Always point it at an empty or dedicated note.
4. **Start the lesson:**
   ```
   /teach how TCP makes a reliable stream out of unreliable packets
   ```
   You can also just ask a question: the `teach` skill starts on its own whenever you ask for an explanation.

From here on, everything that is said and asked appears in the note as it happens.

---

## During a lesson

### Answering questions

Questions open as a popup in the terminal. **With a note linked, each quiz appears in Obsidian first, with the math rendered.** Read it there, then pick the option with the same number in the terminal (arrow keys + Enter).

- Choose **I don't know** when you honestly don't know. It is more useful than a guess, and it is treated as a gap to teach, not as a wrong answer.
- Choose **Other** to type your own answer, or a note about what you're thinking. Claude reads it and adapts.

You will see several kinds of questions:

| When | What | Why |
|---|---|---|
| Probe | Quizzes that get harder until you miss | To find the edge of your knowledge. Misses are expected here. |
| Probe | Your goal and target depth | Depth is one of aware / understand / fluent / apply |
| Teaching | "What do you predict…?" | A hook; you are not expected to know the answer |
| Teaching | Reasoning prompts | You work out the next step yourself |
| Teaching | A check after each concept | Confirms it landed before building on it |
| Practice / application | Drills and transfer problems | For concepts where you asked to be fluent or able to apply them |

### The plan checkpoint

After the probe, Claude shows the orientation, the approach and the dependency map, then **waits**. Reply `go` (or `ok`) to start teaching. This is also the cheapest moment to change the lesson:

- "skip X, I already know it"
- "go deeper on Y"
- "I only need to be aware of Z"
- "start from something more basic"

### Steering

You can say at any time:

- "too easy" / "too hard" / "slow down"
- "fewer questions, just explain" (switches to a narrated style)
- "show me a diagram"
- "give me an example"
- "let's stop here" (ends the session properly; see below)

Diagrams are drawn by the maker agents, checked visually, saved in `viz/`, and embedded in the note.

---

## Ending a lesson

**Always end by saying something like "let's stop here".** Claude then:

1. Ends on a question you get right.
2. Writes or updates **`notes/<topic>.md`**, the clean course sheet with a report on this session.
3. Writes or updates **`progress/<topic>.md`**: what you reached on each concept, your misconceptions, and when each concept is due for review.
4. Tells you when your first review is due, and what comes next.

If you just close the terminal, these files are **not** written.

Next time, run `/teach` on the same topic in a new session (and link a new note with `/md-log`). Claude reads the progress and notes files and continues where you stopped.

---

## Learning from your own material

Slides, lecture-notes PDFs, pages of a book, exercise sheets and past exams all work.

1. Put the file in the vault, e.g. `sources/lecture-2.pdf`. Obsidian can open it too.
2. Link a note: `/md-log lessons/lecture-2.md`.
3. Point `/teach` at it and say what it is for:
   ```
   /teach sources/lecture-2.pdf, I have an exam on it
   /teach pages 140-155 of sources/kittel.pdf
   /teach sources/lecture-2.pdf, and use sources/exam-2024.pdf for practice
   ```

What changes:

- **The source sets the scope and the notation.** Claude teaches what the document covers, in its symbols and conventions, so your notes match your exam.
- **Each kind of document is handled differently.**
  - Slides get their skipped reasoning filled in.
  - Lecture notes are reorganized so each concept comes after the ones it depends on.
  - Book pages have their prerequisites from earlier chapters checked.
  - Exercise sheets and past exams set the target, and are used as models for practice.
- **The source is not treated as always right.** Suspected mistakes are checked with the researcher and pointed out.
- **Locations are cited** in the notes (slide numbers, sections, printed page numbers), with links that open the PDF at the right page.
- **Long documents are split across sessions.** The progress file records how far you got (e.g. `slides 1–18 of 40`).

For a long book, name the pages rather than the whole file. It is faster and keeps the lesson focused.

---

## Reviewing

Concepts you learned come back for review just as they start to fade. The intervals are 1, 3, 7, 16 and 35 days: each correct recall moves a concept to the next interval, and a miss sends it back to 1 day.

```
/review            everything that is due, mixed across topics
/review tcp        only one topic
```

Claude quizzes the due concepts in mixed order, re-teaches anything you miss twice, updates the review dates, and adds a review report to the topic's notes. If nothing is due, it tells you when the next review is.

You can link a note for reviews too: `/md-log lessons/review-2026-09-28.md`.

---

## Files it creates

In your vault:

```
learning/
├── lessons/
│   └── tcp.md          transcript of each lesson (from /md-log)
├── notes/
│   └── tcp.md          clean course sheet + session reports ← reread this one
├── progress/
│   └── tcp.md          mastery table + review schedule
├── verified/
│   └── tcp.md          facts the researcher checked, with sources
├── sources/
│   └── lecture-2.pdf   your own material (optional)
└── viz/
    └── viz-*.png       diagrams, embedded in the lessons and notes
```

- **`lessons/`** holds the full conversation in order: explanations, quizzes, your answers, detours. Keep it as a record.
- **`notes/<topic>.md`** is the file to reread. It has the dependency map, one clean section per concept, a **Common traps** section built from your actual mistakes, and a short dated report for every lesson and review. It is updated in place every session, so it grows into a full course.
- **`progress/<topic>.md`** is a table with columns `node | target | reached | box | last | due | errors`. `/review` uses it to schedule reviews. You can read it, but you don't need to edit it.
- **`verified/<topic>.md`** is the researcher's memory: one entry per checked fact, with its status (`confirmed`, `corrected` or `open`), the claim as taught, the source links and the date. A `corrected` entry also records the wrong version, so you can see what was caught. It is written as soon as each check finishes, so it survives a session that is closed early. Your own notes and progress files never depend on it, so it is safe to delete, but the facts will then be checked again.

---

## Command reference

| Command | What it does |
|---|---|
| `/md-log <note>` | Link a note to this session and mirror the lesson into it, live. Replaces the note's content. |
| `/md-unlog` | Stop mirroring. |
| `/teach <topic or file>` | Start or continue a lesson. It also triggers on its own when you ask for an explanation. |
| `/review [topic]` | Run a spaced-repetition review of whatever is due. |
| "go" | Approve the plan and start teaching. |
| "let's stop here" | End the lesson properly: notes, progress, next review date. |

---

## Troubleshooting

**`/md-log` says "File does not exist".**
The path is relative to the folder where you started `claude`, which must be the vault. Create the note in Obsidian first, then link it.

**The note doesn't update.**
- Check that you linked it with `/md-log` **in this session**. A link lasts for one session only.
- Check `/hooks`. If the hooks are missing, the folder may not be trusted, or the setup changed after this session started. Quit and restart `claude` in the vault.
- In Obsidian, make sure you are looking at the same file, in reading view.

**The quiz appears in the terminal but not in Obsidian.**
No note is linked in this session. Run `/md-log`.

**A diagram fails: "mmdc not found".**
Run `npm install --prefix ~/learn/.claude/scripts`.

**A diagram fails with a browser or puppeteer error.**
Install the headless browser: `npx --prefix ~/learn/.claude/scripts puppeteer browsers install chrome-headless-shell`.

**An SVG diagram fails.**
Install `librsvg2-bin` (or `librsvg` on macOS) or ImageMagick.

**No notes or progress file after a lesson.**
The lesson wasn't ended with "let's stop here". If the session is still open, say it now.

**Too many questions.**
Say "fewer questions, explain more". To change it permanently, edit the teach skill (see below).

---

## Customizing

The teaching method is plain text: edit it to fit how you learn. Changes apply from the next `/teach`, and every vault linked to the repo picks them up.

| To change | Edit |
|---|---|
| The core method, phases, quiz rules | `.claude/skills/teach/SKILL.md` |
| Pacing (success rates, hints, when to ease off) | `.claude/skills/teach/references/pacing.md` |
| Drills, review intervals, progress-file format | `.claude/skills/teach/references/practice.md` |
| Application tasks | `.claude/skills/teach/references/application.md` |
| Course-sheet and report format | `.claude/skills/teach/references/notes.md` |
| Handling of slides, notes, books | `.claude/skills/teach/references/sources.md` |
| Saved fact checks (format, when to reuse or re-check) | `.claude/skills/teach/references/verified.md` |
| Review sessions | `.claude/skills/review/SKILL.md` |
| Models used by the agents | the `model:` line in `.claude/agents/*.md` |

Changes to `settings.json` or the hooks take effect after restarting `claude`.

See [`CLAUDE.md`](CLAUDE.md) for how the pieces fit together, if you want to modify the system with Claude Code itself.

---

## Credits

The teaching philosophy and the original system are by [amosblomqvist](https://github.com/amosblomqvist/learn), shared as-is from [How I Use AI to Learn Things](https://www.youtube.com/watch?v=kzcI5F4tGiU). This fork ports it to Claude Code and adds pacing, practice and review, course notes, and support for your own material.
