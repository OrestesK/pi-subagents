---
description: Parallel context builders for planning handoff
---

Launch fresh-context `context-builder` subagents in parallel to build grounded handoff context for planning or implementation.

Choose top-level parallel tasks when slices are independent and the parent will synthesize them directly; choose a chain with a parallel step when a later child must consume concrete outputs. Use `context: "fresh"` unless inherited context is explicitly required. Size builders from independent material evidence gaps. One or two are allowed only when no useful third slice exists and the parent states why.

Agent frontmatter may define a default output path. For concise direct findings, set `output: false` on every `context-builder` task so that default cannot create an artifact. Only the explicit artifact branch may set distinct output paths under the run or chain directory, for example `context-build/request-and-scope.md`. Use phases/labels when they improve async status readability.

Do not write these context artifacts into the repository unless I explicitly ask for persistent files.

Treat the slash command arguments as the primary request, target, or focus:

$@

If the invocation provides a URL, issue link, file path, plan path, or freeform request, read or fetch that target before assigning builder angles, then pass the target explicitly into every `context-builder` task.

Choose only the independent context slices that materially improve the handoff. The following are examples, not a required set:

1. Request and scope
   Clarify the actual goal, user intent, constraints, non-goals, open questions, and decisions that affect the handoff.

2. Codebase and patterns
   Inspect relevant files, call paths, existing abstractions, tests, package constraints, and local conventions that the next agent must follow.

3. Validation and risks
   Identify reachable failure/boundary behavior relevant to the request, the proof strategy, commands or user flows, dependency/API concerns, and escalation rules.

Adapt the angles when the request calls for it:
- Issue or PR URL: include issue requirements, acceptance criteria, linked discussion, and likely affected files.
- Plan file: include plan consistency, missing context, implementation sequence, and validation readiness.
- External API/library work: include current docs or primary sources through `web_search` when needed.
- Large refactor: include module boundaries, dependency direction, migration/cutover risks, and testability.
- UI/product work: include user flow, accessibility, copy, visual constraints, and implementation touchpoints.

Ask each builder to return compact handoff context with:
- relevant owners/locations and line ranges;
- key snippets or patterns, not full dumps;
- constraints and invariants;
- risks and unknowns;
- validation commands or next-best checks;
- a compact next-role meta-prompt when useful.

Avoid tables in Markdown artifacts. After the builders return, synthesize directly:
- the most important context;
- recommended next action/meta-prompt;
- resolved facts, assumptions, and remaining material decisions;
- artifact paths only as supporting evidence.

This recipe remains a read-only context pass even when the request also asks for implementation. After context synthesis, route any implementation request through the normal task classification, reviewed proposal, and approval boundary; do not treat the request as authority to implement from this recipe.
