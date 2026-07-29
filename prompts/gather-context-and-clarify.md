---
description: Use subagents to gather context, then ask clarifying questions
---

Based on our discussion and my intent, launch focused context-gathering subagents before planning or implementing.

Use `scout` to inspect the relevant local files, existing patterns, constraints, tests, and likely integration points. Use `researcher` when external docs, recent sources, ecosystem context, or primary evidence would improve the answer.

Size subagents from independent evidence gaps; one or two are allowed only when no useful third role exists and the parent states why. Give each a distinct evidence target and stop condition. Ask for concise findings plus only unresolved material user-owned decisions.

After they return, inspect and synthesize what is known. Use `ask_user` only for remaining material choices. Briefly explain why each choice matters, recommend an option when useful, and ask one clear question in normal language.

$@
