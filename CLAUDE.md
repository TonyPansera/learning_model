# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A Claude Code configuration for learning, not an application. It is a fork of amosblomqvist/learn (originally a pi `.pi/` directory), ported to Claude Code. The product is the `.claude/` directory: users symlink it into a learning project (usually an Obsidian vault) with `ln -s <repo>/.claude .claude`. Because of that:

- Everything that runs must resolve paths relative to the **learning project** (cwd / `$CLAUDE_PROJECT_DIR`), never relative to this repo.
- Per-session state must not be written inside `.claude/`. Through the symlink it would be shared by every vault. `md-log` keeps its state in `~/.claude/md-log/<session-id>.json` (or under `$CLAUDE_CONFIG_DIR`).
- This root `CLAUDE.md` is only for developing the repo. It is not loaded in the vaults.

There is no build, lint, or test suite. The only dependency is `@mermaid-js/mermaid-cli`: `npm install --prefix .claude/scripts`.

## How the pieces fit

- **`teach` skill**: the pedagogy (unconditional truths first, "how could I have discovered this?") and the probe → plan → teach process. It calls three mechanisms:
  - **`quiz`**: not a real tool. It is a protocol in `teach/SKILL.md`: `AskUserQuestion` with `header: "Quiz"`, 2–3 real options plus `I don't know`, answer key fixed before the call, shuffled by the model, graded in the next message. The pi original was a custom TUI tool, and its rules were ported into that protocol section.
  - **`AskUserQuestion`** (plain): for questions with no right answer (the learner's goal, preferences).
  - **`researcher` agent**: for fact verification and topic scoping.

  `SKILL.md` stays the core; the detail lives in `teach/references/`, which Claude reads on demand. `pacing.md` covers the emotional tension: signals, dials, success-rate targets, miss and boredom caps, the hint ladder. `practice.md` covers retrieval, fluency, Leitner spacing and the progress-file format. `application.md` covers transfer tasks. `notes.md` defines the course sheet and session reports. `sources.md` covers teaching from a file the learner provides (slides, lecture notes, book pages, exercises or past exams): the source sets the scope and notation, and each kind gets different handling. The four aspects (awareness, understanding, practice, application) map to a per-node **target depth** (`aware`/`understand`/`fluent`/`apply`), asked in Phase 1b and drawn on the dependency map.
- **Progress and `/review`**: at the end of a session, `teach` writes `progress/<topic-slug>.md` in the vault (frontmatter plus the table `node | target | reached | box | last | due | errors / misconceptions`). This is the only memory kept across sessions. It also writes `notes/<topic-slug>.md` (format in `teach/references/notes.md`): a clean course sheet that is updated in place on every session, plus dated session reports. `review` appends its own report there. The `review` skill reads every progress file, quizzes the due nodes mixed across topics, and moves them between Leitner boxes (1/3/7/16/35 days).
- **`hooks/quiz-timer.mjs`**: `PreToolUse(AskUserQuestion)` stores a start time; `PostToolUse` returns `Answer time: Ns` to Claude as `additionalContext`. It is a pacing and fluency signal that is deliberately kept out of the md-log file.
- **`visualize` skill → `mermaid-maker` / `svg-maker` agents**: the main session writes a minimal brief; the maker writes a source file under `/tmp/claude-visual-tools/src/`, renders it with `node .claude/scripts/viz.mjs render <file>`, `Read`s the PNG to check it, then publishes with `--publish <slug>` into `<project>/viz/`. The maker's final message must end with the `RESULT:` / `filename:` / `path:` block (or `RESULT: NONE`), and the skill embeds `![[<filename>|500]]`.
- **md-log** (`hooks/md-log.mjs` + `settings.json` + the `md-log`/`md-unlog` skills): `/md-log <file>` runs `md-log.mjs link`, which backfills the whole transcript into the file (**overwriting it**). The file must already exist. After that, `Stop` and `Pre/PostToolUse(AskUserQuestion)` hooks run `md-log.mjs hook`, which appends transcript lines past a stored line offset. It renders user prompts, assistant text and AskUserQuestion Q&A as Obsidian callouts. It drops tool calls, meta entries, built-in slash commands and the `/md-log` turn itself.

## Couplings to keep in sync

- `md-log.mjs` parses Claude Code's transcript JSONL directly: `type`, `isMeta`, `isSidechain`, `message.content[]` blocks, `toolUseResult.{questions,answers,annotations}`, `<command-name>`/`<command-args>` tags, and `~/.claude/projects/<cwd with non-alphanumerics → "-">/<session>.jsonl`. If the transcript format changes, this is where it breaks.
- The header `"Quiz"` is shared by the quiz protocol (`teach/SKILL.md`) and `isQuiz()` in `md-log.mjs`.
- The progress-file columns and the Leitner intervals are defined in `teach/references/practice.md`. Three places depend on them: the teach "Close the session" step, the Phase 1 progress read, and `review/SKILL.md`.
- The reference files are read by relative path: `review/SKILL.md` points at `.claude/skills/teach/…`. Keep those paths if you move files.
- `viz.mjs` output (`preview: <path>`, the `RESULT:` block) is shared with the maker agents' instructions and the `visualize` skill.
- The `Bash(...)` permission patterns in `settings.json` and `allowed-tools` in the md-log skills must match the actual command strings (`node .claude/hooks/md-log.mjs …`, `node .claude/scripts/viz.mjs …`).
- Hook commands must always exit 0 and print nothing. `md-log.mjs` swallows errors in `hook` mode on purpose.

## Testing changes manually

- Timer: `echo '{"session_id":"t","hook_event_name":"PreToolUse"}' | CLAUDE_CONFIG_DIR=<tmp> node .claude/hooks/quiz-timer.mjs`, then the same with `PostToolUse`. The second call should print the `additionalContext` JSON.
- Renderer: `node .claude/scripts/viz.mjs render some.mmd` (or `.svg`), then open the printed PNG. Add `--publish test` to check publishing into `./viz/`.
- md-log against any existing transcript, without touching real state: write `{"file":"<out.md>","transcript":"<t.jsonl>","offset":0,"lastBlock":null,"skipping":false,"pendingAsk":[]}` to `<tmp>/md-log/t.json`, then run `echo '{"session_id":"t","transcript_path":"<t.jsonl>"}' | CLAUDE_CONFIG_DIR=<tmp> node .claude/hooks/md-log.mjs hook`.
- Skills and agents: edits to `.claude/skills` are picked up live. New agents and `settings.json` hook changes need a Claude Code restart.

## Writing style inside skills and agents

The skill and agent prompts are the product, and their wording is deliberate: they are dense, emphatic, and state the reason behind each rule. When you change behavior, change the prose in the same voice, and keep the pedagogy (the teach principles, correctness-first makers) intact unless asked. Anything the learner sees (lessons, quiz text) is read in Obsidian, so math goes in LaTeX (`$…$`, `$$…$$`).
