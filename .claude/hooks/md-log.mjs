#!/usr/bin/env node
/**
 * md-log — mirror a Claude Code session to a markdown file for comfortable
 * reading (e.g. rendered live in Obsidian: math, code, callouts, embeds).
 *
 * Captures only reading-relevant content, straight from the session transcript:
 *   - user prompts (slash-command invocations become a one-line note)
 *   - assistant text (lesson prose)
 *   - AskUserQuestion Q&A (header "Quiz" → Quiz callout, else Question)
 * Tool calls, tool output, thinking, and system-injected text are omitted.
 *
 * Modes:
 *   node md-log.mjs link <file> [session-id]
 *       Link <file> (must already exist) to the session and backfill it:
 *       the file's content is REPLACED by the mirror of the session so far.
 *       Without a valid session id, the newest transcript of the cwd's
 *       project is used (the session that is running the command).
 *   node md-log.mjs unlink [session-id]
 *       Stop mirroring.
 *   node md-log.mjs hook
 *       Hook entry point (Stop, PreToolUse/PostToolUse on AskUserQuestion):
 *       reads the hook JSON on stdin and appends whatever is new in the
 *       transcript since the last sync. No-op for unlinked sessions.
 *
 * State lives outside the project (the .claude dir may be a symlink shared by
 * several vaults): <claude config dir>/md-log/<session-id>.json.
 */

import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude")
const STATE_DIR = path.join(CONFIG_DIR, "md-log")
const LOG_COMMANDS = new Set(["/md-log", "/md-unlog"])
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
// User-role text Claude Code injects itself (command output, bash mode, …).
const INTERNAL_USER_TEXT = /^<(local-command-[a-z]+|bash-[a-z]+|task-notification|user-prompt-submit-hook)\b|^\[Request interrupted/

// ── State ────────────────────────────────────────────────────────────────────

function statePath(sessionId) {
  return path.join(STATE_DIR, `${sessionId}.json`)
}

function loadState(sessionId) {
  try {
    return JSON.parse(fs.readFileSync(statePath(sessionId), "utf8"))
  } catch {
    return null
  }
}

function saveState(sessionId, state) {
  fs.mkdirSync(STATE_DIR, { recursive: true })
  fs.writeFileSync(statePath(sessionId), JSON.stringify(state, null, 2), "utf8")
}

function freshCursor() {
  // lastBlock: kind of the last block written ("user" | "assistant" | "qa"), so
  //   consecutive assistant text shares one CLAUDE header.
  // skipping: true while inside an /md-log or /md-unlog turn (kept out of the log).
  // pendingAsk: AskUserQuestion tool_use ids still awaiting their result.
  // pendingCommand: slash command seen, not yet known to be a skill.
  // prerendered: question texts already written from a PreToolUse hook's
  //   tool_input, so the transcript's copy of them is not written twice.
  return { offset: 0, lastBlock: null, skipping: false, pendingAsk: [], pendingCommand: null, prerendered: [] }
}

// ── Transcript ───────────────────────────────────────────────────────────────

/** Complete JSONL lines from `offset` on; a trailing partial line is left for later. */
function readLines(transcript, offset) {
  const lines = fs.readFileSync(transcript, "utf8").split("\n")
  lines.pop() // "" after the final newline, or a partial line still being written
  return { lines: lines.slice(offset), total: lines.length }
}

function projectTranscriptDir(cwd) {
  return path.join(CONFIG_DIR, "projects", cwd.replace(/[^a-zA-Z0-9]/g, "-"))
}

function newestTranscript(cwd) {
  const dir = projectTranscriptDir(cwd)
  let best = null
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".jsonl")) continue
    const p = path.join(dir, name)
    const mtime = fs.statSync(p).mtimeMs
    if (!best || mtime > best.mtime) best = { p, mtime }
  }
  if (!best) throw new Error(`No transcript found in ${dir}`)
  return best.p
}

// ── Formatting ───────────────────────────────────────────────────────────────

function callout(type, title, bodyLines) {
  const lines = [`> [!${type}] ${title}`]
  for (const line of bodyLines) lines.push(line.length === 0 ? ">" : `> ${line}`)
  return lines.join("\n")
}

function isQuiz(q) {
  return /^quiz/i.test(q.header ?? "")
}

function questionCallout(q) {
  const body = [...String(q.question ?? "").split("\n")]
  if (q.multiSelect) body.push("", "*(select all that apply)*")
  const options = Array.isArray(q.options) ? q.options : []
  if (options.length > 0) {
    body.push("")
    options.forEach((o, i) => body.push(`${i + 1}. ${o.label}${o.description ? ` — ${o.description}` : ""}`))
  }
  return callout("question", isQuiz(q) ? "Quiz" : "Question", body)
}

function answerCallout(q, answer, note) {
  const body = answer ? String(answer).split("\n") : ["(no answer)"]
  if (note) {
    const noteLines = String(note).split("\n")
    body.push("", `Note: ${noteLines[0]}`, ...noteLines.slice(1))
  }
  return callout("example", isQuiz(q) ? "Your answer" : "Answer", body)
}

function textOf(content) {
  if (typeof content === "string") return content
  if (!Array.isArray(content)) return ""
  return content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n")
}

// ── Transcript → markdown blocks ─────────────────────────────────────────────

/**
 * Render entries into markdown blocks, advancing `cursor` (mutated). Question
 * texts met in AskUserQuestion calls are added to `rendered`.
 */
function render(lines, cursor, rendered = new Set()) {
  const blocks = []
  const push = (kind, text) => {
    blocks.push(text)
    cursor.lastBlock = kind
  }

  for (const line of lines) {
    let e
    try {
      e = JSON.parse(line)
    } catch {
      continue
    }
    if (e.isSidechain || !e.message) continue
    const content = e.message.content

    // A slash command is logged only once we know it was a skill: skills are
    // followed by a meta entry holding their expanded body, built-ins (/model,
    // /clear, …) are not.
    const command = cursor.pendingCommand
    cursor.pendingCommand = null
    if (command && e.type === "user" && e.isMeta && !/^<local-command-/.test(textOf(content))) {
      push("user", `> [!note] SKILL loaded: ${command.name}` + (command.args ? `\n\n> [!quote] YOU\n\n${command.args}` : ""))
    }

    if (e.type === "user") {
      const toolResults = Array.isArray(content) ? content.filter((c) => c.type === "tool_result") : []
      if (toolResults.length > 0) {
        for (const r of toolResults) {
          const idx = cursor.pendingAsk.indexOf(r.tool_use_id)
          if (idx === -1) continue
          cursor.pendingAsk.splice(idx, 1)
          const res = e.toolUseResult
          if (res && Array.isArray(res.questions)) {
            for (const q of res.questions) {
              push("qa", answerCallout(q, res.answers?.[q.question], res.annotations?.[q.question]?.notes))
            }
          } else {
            push("qa", callout("warning", "Question — cancelled", ["(user skipped)"]))
          }
        }
        continue
      }
      if (e.isMeta) continue

      const text = textOf(content)
        .replace(/<system-reminder>[\s\S]*?<\/system-reminder>/g, "")
        .trim()
      if (!text || INTERNAL_USER_TEXT.test(text)) continue

      const name = /<command-name>([^<]*)<\/command-name>/.exec(text)?.[1]?.trim()
      if (name) {
        cursor.skipping = LOG_COMMANDS.has(name)
        if (!cursor.skipping) {
          const args = /<command-args>([\s\S]*?)<\/command-args>/.exec(text)?.[1]?.trim()
          cursor.pendingCommand = { name: name.replace(/^\//, ""), args }
        }
        continue
      }

      cursor.skipping = false
      push("user", `> [!quote] YOU\n\n${text}`)
      continue
    }

    if (e.type === "assistant") {
      if (cursor.skipping || e.message.model === "<synthetic>" || !Array.isArray(content)) continue
      for (const c of content) {
        if (c.type === "text" && c.text?.trim()) {
          const text = c.text.trim()
          push("assistant", cursor.lastBlock === "assistant" ? text : `> [!abstract] CLAUDE\n\n${text}`)
        } else if (c.type === "tool_use" && c.name === "AskUserQuestion") {
          cursor.pendingAsk.push(c.id)
          for (const q of c.input?.questions ?? []) {
            const i = (cursor.prerendered ?? []).indexOf(q.question)
            if (i !== -1) cursor.prerendered.splice(i, 1)
            else push("qa", questionCallout(q))
            rendered.add(q.question)
          }
        }
      }
    }
  }
  return blocks
}

function append(file, blocks) {
  if (blocks.length === 0) return
  let prefix = ""
  try {
    if (fs.statSync(file).size > 0) prefix = "\n" // every write already ends with "\n"
  } catch {
    return // file deleted externally; drop silently
  }
  fs.appendFileSync(file, prefix + blocks.join("\n\n") + "\n", "utf8")
}

// ── Modes ────────────────────────────────────────────────────────────────────

function resolveSession(arg) {
  const transcript =
    arg && UUID_RE.test(arg)
      ? path.join(projectTranscriptDir(process.cwd()), `${arg}.jsonl`)
      : newestTranscript(process.cwd())
  if (!fs.existsSync(transcript)) throw new Error(`Transcript not found: ${transcript}`)
  return { sessionId: path.basename(transcript, ".jsonl"), transcript }
}

function link(fileArg, sessionArg) {
  if (!fileArg) throw new Error("Usage: /md-log <filepath>")
  const file = path.resolve(fileArg)
  // Links into an existing note only — never creates one, so a typo'd path
  // can't scatter new files around the vault.
  if (!fs.existsSync(file)) throw new Error(`File does not exist: ${file}`)
  if (!fs.statSync(file).isFile()) throw new Error(`Not a file: ${file}`)

  const { sessionId, transcript } = resolveSession(sessionArg)
  const cursor = freshCursor()
  const { lines, total } = readLines(transcript, 0)
  const blocks = render(lines, cursor)
  // The /md-log turn itself is still running; keep skipping until the next prompt.
  cursor.skipping = true
  cursor.offset = total
  fs.writeFileSync(file, blocks.length > 0 ? blocks.join("\n\n") + "\n" : "", "utf8")
  saveState(sessionId, { file, transcript, ...cursor })
  console.log(`Linked: ${file} (${blocks.length} blocks backfilled)`)
}

function unlink(sessionArg) {
  const { sessionId } = resolveSession(sessionArg)
  const state = loadState(sessionId)
  if (!state) {
    console.log("No file linked")
    return
  }
  fs.rmSync(statePath(sessionId), { force: true })
  console.log(`Unlinked: ${path.basename(state.file)}`)
}

async function hook() {
  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}")
  const sessionId = input.session_id
  if (!sessionId) return
  const state = loadState(sessionId)
  if (!state) return
  // The final assistant message can land in the transcript slightly after Stop fires.
  if (input.hook_event_name === "Stop") await new Promise((r) => setTimeout(r, 300))

  const transcript = input.transcript_path || state.transcript
  const { lines, total } = readLines(transcript, state.offset)
  const rendered = new Set()
  const blocks = render(lines, state, rendered)
  state.offset = total

  // The question must be readable (rendered LaTeX) in the note BEFORE the
  // learner answers the terminal popup. The hook input carries the question
  // itself, so write it now if the transcript didn't have it yet; the
  // transcript copy is skipped later via `prerendered`.
  if (input.hook_event_name === "PreToolUse" && input.tool_name === "AskUserQuestion" && !state.skipping) {
    for (const q of input.tool_input?.questions ?? []) {
      if (rendered.has(q.question)) continue
      blocks.push(questionCallout(q))
      state.prerendered = [...(state.prerendered ?? []), q.question]
      state.lastBlock = "qa"
    }
  }

  append(state.file, blocks)
  saveState(sessionId, state)
}

const [mode, ...args] = process.argv.slice(2)
try {
  if (mode === "link") link(args[0], args[1])
  else if (mode === "unlink") unlink(args[0])
  else if (mode === "hook") await hook()
  else throw new Error("Usage: md-log.mjs link <file> [session-id] | unlink [session-id] | hook")
} catch (err) {
  // Never break the session from a hook; only link/unlink report failures.
  if (mode !== "hook") {
    console.error(String(err.message ?? err))
    process.exit(1)
  }
}
