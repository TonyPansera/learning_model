---
name: md-log
description: Mirror this session to an existing markdown file (backfills history, then keeps it updated live). Usage — /md-log <filepath>
argument-hint: <filepath>
disable-model-invocation: true
allowed-tools: Bash(node .claude/hooks/md-log.mjs:*)
---

Run exactly this command, then reply with its output line and nothing else:

```bash
node .claude/hooks/md-log.mjs link "$ARGUMENTS" "${CLAUDE_SESSION_ID}"
```

If it fails, report the error line verbatim.
