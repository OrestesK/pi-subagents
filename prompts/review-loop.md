---
description: Review/fix loop until clean
---

Run a parent-orchestrated review loop for the requested work. The parent session normally owns implementation, fixes, integration, and final verification.

Use the `subagent` tool for broad read-only reconnaissance, research, planning advice, review, and validation. Child subagents must receive concrete role-specific tasks; they must not run subagents or manage the loop themselves unless the parent intentionally selected an explicit fanout agent whose builtin `tools` includes `subagent` for that assigned fanout.

If the invocation includes an implementation request, the parent implements the current approved behavioral contract. Bind every write pass to its revision, behavior, non-goals, protected boundaries, proof, and stop conditions. Likely implementation locations guide execution; they are not the user approval boundary. If the current effective change is already the target, start with review. The parent directly reads the sources it edits and every delegated diff.

Use a write-capable child only when at least two independent implementation or fix areas can proceed concurrently in the shared checkout. The parent must own at least one area, and every writer receives an exclusive, non-overlapping internal file/symbol assignment, required behavior/non-goals, proof/validation evidence, and prohibited material decisions. The child stops before touching an unassigned file and contacts the parent only for a real blocker, overlap, stale revision, or an unapproved material decision.

Do not run repository-wide mutating formatters, code generators, migrations, or equivalent commands while concurrent writes are active. The parent inspects, integrates, and verifies every delegated change.

For the initial nontrivial review, use the canonical initial-review fanout with fresh-context read-only `reviewer` agents and genuinely distinct evidence targets. Add more only for another distinct useful surface. Reviewers inspect the actual target/effective change directly and never edit or become writers.

Give each reviewer the approved behavior, non-goals, relevant decisions, required proof and available evidence, assigned angle/evidence target, and stop condition. Correctness/regressions, proof/validation, and simplicity/ownership are common primary candidates, not a mandatory matrix. Add security, performance, docs/API, data, ops, or user-flow angles only when the affected path reaches them.

After reviewers return, the parent validates scope, producer/reachability, impact, proof, and behavior preservation, then synthesizes:

1. primary in-scope required findings;
2. incidental material adjacent risks;
3. incidental optional cleanup/polish;
4. rejected/deferred findings with reason.

Reviewers actively hunt only the primary assigned scope unless cleanup/adjacent analysis was explicitly requested as primary. Do not blindly apply suggestions. The parent automatically applies only validated, mechanically local, non-material fixes inside the approved behavior. Another necessary implementation file is allowed; new material behavior, architecture, dependency, compatibility, security/data, persistent artifact, or protected action requires an amendment. After fixes, use the canonical post-fix follow-up tier. Never loop for incidental polish.

Continue only while a new validated in-scope primary finding produces a material correction. Stop and summarize when:

- the final state is clean;
- only incidental/non-actionable/deferred findings remain;
- the same root repeats or progress stalls;
- a blocker appears;
- a new material decision or protected action is approval-gated.

Do not stop merely because of an arbitrary round count. On completion, inspect the final change, run all relevant read-only verification automatically, and summarize rounds, fixes, finding partitions, evidence, residual risks, and why the loop stopped. Mutating validation remains separately authorized.

Additional target, implementation request, or primary review focus from the slash command invocation:

$@
