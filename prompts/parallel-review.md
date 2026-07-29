---
description: Parallel subagents review
---

Launch parallel reviewers for an adversarial review of the current work.

Use fresh context, not forked context, unless I explicitly ask for forked context. Reviewers should inspect the repository, relevant instructions, and current diff directly from files and commands. Do not rely on the main conversation history.

Give each reviewer a distinct angle. Generate the angles dynamically from the user's intent, the plan, the implemented code, and the current diff. If I specify angles, use mine. Otherwise, choose the highest-value review angles for this specific work.

Common candidates below are examples, not a required matrix:

1. Correctness and regressions
   Check whether the change satisfies the request and preserves behavior across states reachable from inspected producers and contracts.

2. Tests and validation
   Check whether tests or validation were added at the right layer, whether assertions are meaningful, and whether the chosen verification commands are enough.

3. Simplicity and ownership
   Check for concrete accidental complexity, duplicate ownership, brittle abstractions, or structure that makes the approved behavior harder to reason about. Do not proactively hunt optional cleanup/polish unless cleanup was explicitly requested as the primary target.

Choose or adapt angles only when the affected path calls for them:
- TypeScript-heavy changes may need type/source-of-truth evidence.
- UI-heavy changes may need UX, accessibility, copy, or visual evidence.
- Security/privacy/data angles apply only when the changed path reaches those boundaries.
- Docs-heavy changes may need accuracy and reader-flow evidence.
- Broad structural changes may need module-boundary or testability evidence.

For nontrivial review, use the canonical initial-review fanout and select genuinely distinct angles; add more only for another useful surface. For numerous or materially disputed findings, use the canonical fanout/reduction rules.

Give every reviewer the approved behavior, non-goals, relevant decisions, actual target/effective change, required proof and available evidence, one distinct angle/evidence target, and a stop condition. Reviewers return concise evidence-backed findings and never edit or become writers. Findings are evidence, not authority to expand the behavioral contract.

While reviewers run, do your own narrow inspection if useful. After they return, validate scope, producer/reachability, impact, proof, and behavior preservation, then synthesize:

1. primary in-scope required findings;
2. incidental material adjacent risks found during primary review;
3. incidental optional cleanup/polish found during primary review;
4. rejected/deferred feedback with reason.

Only primary findings can block or drive automatic fixes. Do not blindly apply suggestions.

Autofix mode: if the invocation contains the exact word `autofix`, treat it as workflow control, not review scope. Remove it before deciding the review target. After synthesis, apply only fixes worth doing now that the current approved contract already authorizes, validate, and summarize. A fix needing another file, range, behavior, dependency, compatibility decision, or changed-line budget requires an amendment even in autofix mode. Do not apply optional improvements unless explicitly requested. If there are no authorized fixes worth doing now, do not edit.

Without autofix mode, ask before applying fixes unless the current contract already authorizes both addressing review feedback and the resulting exact edits. When you ask, end with a compact numbered menu so I can respond with a number. Use wording suited to the findings, but include these choices when applicable:

```text
Reply with [1], [2], or further instructions:
[1] Apply only fixes already authorized by the current contract.
[2] Present a contract amendment for the optional improvements; do not apply it yet.
```

Additional review target or focus from the slash command invocation:

$@

If the invocation provides a URL, issue link, file path, plan path, or freeform focus, treat it as the primary review scope. Read or fetch that target before assigning reviewer angles, and pass the target explicitly into each reviewer task.
