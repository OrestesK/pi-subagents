---
description: Parallel subagents research
---

Launch parallel research subagents to build a grounded answer to the current question or decision.

Use fresh context, not forked context, unless I explicitly ask for forked context. Researchers and scouts should inspect sources directly instead of relying on the main conversation history.

Use a combination of `researcher` and `scout` subagents:
- Use `researcher` for web, docs, standards, ecosystem, recent changes, benchmarks, and primary-source evidence.
- Use `scout` for local codebase context, existing implementation patterns, repo constraints, and files that would be affected.

Give each subagent a distinct angle selected from the evidence the question actually needs. Candidate angles include:

1. External evidence
   Use `researcher` to find current, authoritative sources: official docs, specs, release notes, benchmarks, issue threads, or primary explanations.

2. Local code context
   Use `scout` to inspect the repository for relevant files, existing patterns, constraints, tests, and likely integration points.

3. Practical tradeoffs
   Use `researcher` or `scout`, whichever fits, to compare options, demonstrated risks, maintenance cost, and validation difficulty.

Adapt the angles when the question calls for it:
- Library/API questions: include official docs and recent examples.
- Architecture decisions: include local module boundaries, dependency direction, and migration cost.
- Debugging questions: include likely failure modes, local call paths, and exact error evidence.
- UI/product questions: include user flow, accessibility, design precedent, and implementation constraints.
- Time-sensitive topics: include a recent-developments angle and prefer 2026/2025 sources.

Size roles from independent material evidence gaps. One or two children are allowed only when no useful third role exists and the parent states why. The parent frames the question and assigns evidence targets; children research or scout rather than inventing broad plans.

Ask each subagent to return concise findings with evidence:
- file paths and line ranges for local findings
- source links for external findings
- confidence level and gaps
- recommended next step or decision implication

Do not ask subagents to edit files. This recipe remains a read-only research pass even when the request also asks for implementation. After research synthesis, route any implementation request through the normal task classification, reviewed proposal, and approval boundary; do not treat the request as authority to implement from this recipe.

After the subagents return, inspect their evidence and synthesize directly:
- what we know;
- what the local codebase implies;
- tradeoffs and risks;
- gaps or assumptions;
- the recommended next move.

Avoid tables in Markdown outputs. Artifacts support rather than replace the direct summary. If findings disagree, call out the disagreement. A material choice returns to the user with previous behavior and recommendation.

$@
