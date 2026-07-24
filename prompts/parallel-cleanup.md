---
description: Parallel cleanup review
---

Run a fresh-context parallel cleanup review when cleanup/simplification is explicitly the primary approved review target.

Use the `subagent` tool with `context: "fresh"` unless I explicitly ask for inherited context. For nontrivial cleanup review, launch at least three reviewers with genuinely distinct cleanup evidence targets; add more only for another useful surface. Reviewers inspect the actual target/effective change directly and never edit.

Do not write reviewer output files into the repository unless I explicitly ask for artifacts. Prefer `output: false` for concise reviewer tasks.

Candidate angle: deslop pass.

If the `deslop` skill is available, pass it to this reviewer. If not, inline the guidance below. Ask this reviewer to look for AI-slop patterns in the changed scope:
- comments that restate code, placeholder text, stale rationale, or debug leftovers;
- defensive checks that hide useful errors, return vague defaults, or validate trusted internal data after a real boundary was already crossed;
- type escapes, broad casts, duplicated type definitions, or object-bag typing where a local source-of-truth type exists;
- style drift from nearby non-slop code and project instructions;
- generated-sounding docs, changelog text, UI copy, status text, or test names;
- pass-through wrappers, dead helpers, duplicate helper signatures, duplicated test harness setup, or abstractions that do not enforce an invariant;
- UI or CLI copy that is noisy, vague, brittle, or makes the user do extra interpretation.

Tell this reviewer to treat tool output and slop-scan-style findings as leads, not verdicts. It should flag only concrete issues in the requested scope with evidence, severity, file/line references, and the smallest safe fix.

Candidate angle: verbosity pass.

If the `verbosity-cleaner` skill is available, pass it to this reviewer. If not, inline the guidance below. Ask this reviewer to look for needless verbosity in code, tests, docs, status text, grouped messages, receipts, and changelog wording:
- single-use helpers that merely paraphrase an expression;
- temporary variables that only name obvious expressions;
- nested returns or branches that can become direct returns without hiding intent;
- multi-line cleanup scaffolding that can use a local direct pattern while preserving cleanup semantics;
- repeated boilerplate that can use an existing local fixture or a small local helper;
- tests that restate formatter details already covered at a cheaper layer;
- regression tests where one focused assertion would cover the bug but wrapper/API-adjacent tests only repeat the same claim;
- prose that says the same thing twice, sounds generic, or buries the important rule.

Tell this reviewer that shorter is only better when it is clearer and preserves behavior, error signals, cleanup semantics, useful invariants, and local style.

Candidate angle: ownership/directness pass.

Ask this reviewer to trace the approved behavior to its canonical owner and look for concrete duplicate ownership, scattered special cases, pass-through layers, or avoidable concepts that make the changed path harder to reason about. Require a behavior-preserving smaller direction and proof; taste-only restructuring is not a finding.

Give every reviewer the approved behavior, non-goals, relevant decisions, target/effective change, proof/evidence, assigned angle/evidence target, and stop condition. Reviewers return the three finding partitions. Cleanup is primary here; incidental material adjacent risks and further optional polish stay separate. Findings are evidence, not authority to expand behavior.

While reviewers run, do your own narrow inspection if useful. After they return, validate scope, producer/reachability, impact, proof, and behavior preservation, then synthesize:

1. primary in-scope cleanup findings worth doing now;
2. incidental material adjacent risks;
3. incidental optional cleanup/polish beyond the requested target;
4. rejected/deferred feedback with reason.

Do not blindly apply suggestions.

Autofix mode: if the invocation contains the exact word `autofix`, treat it as workflow control, not cleanup scope. Remove it before deciding the cleanup target. After synthesis, apply only fixes worth doing now that the current approved contract already authorizes, validate, and summarize. A fix needing another file, range, behavior, dependency, compatibility decision, or changed-line budget requires an amendment even in autofix mode. Do not apply optional improvements unless explicitly requested. If there are no authorized fixes worth doing now, do not edit.

Without autofix mode, ask before applying fixes unless the current contract already authorizes both addressing review feedback and the resulting exact edits. When you ask, end with a compact numbered menu so I can respond with a number. Use wording suited to the findings, but include these choices when applicable:

```text
Reply with [1], [2], or further instructions:
[1] Apply only fixes already authorized by the current contract.
[2] Present a contract amendment for the optional improvements; do not apply it yet.
```

Additional scope or focus from the slash command invocation:

$@
