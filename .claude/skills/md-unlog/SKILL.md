---
name: md-unlog
description: Stop mirroring this session to the markdown file linked with /md-log.
disable-model-invocation: true
allowed-tools: Bash(node .claude/hooks/md-log.mjs:*)
---

Run exactly this command, then reply with its output line and nothing else:

```bash
node .claude/hooks/md-log.mjs unlink "${CLAUDE_SESSION_ID}"
```
