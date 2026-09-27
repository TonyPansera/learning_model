#!/usr/bin/env node
/**
 * quiz-timer — measure how long the learner takes to answer an AskUserQuestion
 * and hand that time back to Claude (never to the learner or the md-log file).
 *
 *   PreToolUse(AskUserQuestion)   records the start time
 *   PostToolUse(AskUserQuestion)  emits "Answer time: Ns" as additionalContext
 *
 * Claude uses it as a fluency / pacing signal (see
 * skills/teach/references/pacing.md and practice.md). The time includes
 * reading the question, so it is only meaningful relative to other answers.
 *
 * State lives outside the project (the .claude dir may be a symlink shared by
 * several vaults): <claude config dir>/quiz-timer/<session-id>.json.
 * Always exits 0; prints nothing unless it has a time to report.
 */

import * as fs from "node:fs"
import * as os from "node:os"
import * as path from "node:path"

const CONFIG_DIR = process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), ".claude")
const STATE_DIR = path.join(CONFIG_DIR, "quiz-timer")

try {
  const input = JSON.parse(fs.readFileSync(0, "utf8") || "{}")
  const sessionId = input.session_id
  if (sessionId) {
    const statePath = path.join(STATE_DIR, `${sessionId}.json`)
    if (input.hook_event_name === "PreToolUse") {
      fs.mkdirSync(STATE_DIR, { recursive: true })
      fs.writeFileSync(statePath, JSON.stringify({ startedAt: Date.now() }), "utf8")
    } else if (input.hook_event_name === "PostToolUse") {
      const { startedAt } = JSON.parse(fs.readFileSync(statePath, "utf8"))
      fs.rmSync(statePath, { force: true })
      const seconds = Math.round((Date.now() - startedAt) / 1000)
      console.log(
        JSON.stringify({
          hookSpecificOutput: { hookEventName: "PostToolUse", additionalContext: `Answer time: ${seconds}s` },
        }),
      )
    }
  }
} catch {
  // Missing start file or bad input: report nothing rather than break the session.
}
