---
description: Quick adversarial check of an assumption, plan, or claim
---

Run a quick adversarial check before committing to an assumption, answer, plan, fix, or recommendation.

Target assumption, claim, plan, or focus:

$@

Use this when a full debate is too heavy but single-context self-review is not enough. This is designed to be cheap in wall-clock time but still adversarial. Before launching children, hydrate the target: read/fetch the referenced file, diff, URL, issue, PR, plan, log, screenshot, or quoted claim enough to name the concrete scope. Include that concrete target and any relevant paths/links in every child task. Use the `subagent` tool with fresh-context reviewers unless I explicitly ask for forked context. Do not ask children to edit files. Do not satisfy this prompt with inline self-critique only unless subagents are unavailable; if unavailable, say so explicitly.

Select distinct attack angles from the claim and missing evidence. A truly trivial/local claim may use one independent skeptic. Any nontrivial review uses at least three fresh parallel reviewers with distinct evidence targets; broader uncertainty may justify more or the full quality-gate/debate pattern. Security, privacy, data, ops, or other domain angles apply only when the target reaches those boundaries.

Runtime shape when subagents are available:

```typescript
subagent({
  tasks: selectedAttackAngles.map((angle) => ({
    agent: "reviewer",
    task: `Quick adversarial check (${angle.name}) on <target>. Approved claim/behavior: <contract>. Non-goals: <non-goals>. Existing evidence: <evidence>. Attack using ${angle.evidenceTarget}; return the three finding partitions with concrete disconfirming evidence and what changes the answer. Never edit. Stop when ${angle.stopCondition}.`,
    output: false,
    progress: false,
  })),
  concurrency: selectedAttackAngles.length,
  context: "fresh",
  async: true,
});
```

Every reviewer also receives relevant decisions and proof expectations. Every angle needs a concrete evidence target and stop condition; do not duplicate roles or manufacture findings. For a nontrivial check, `selectedAttackAngles` contains at least three entries.

The parent validates findings for scope, reachability, impact, proof, and behavior preservation. Parent synthesis must be short:

- confirmed, weakened, or rejected;
- strongest objection;
- whether more investigation is needed;
- next action or user decision.

Do not bury the contradiction. If the check undermines the plan, say so and change course inside the approved behavior or ask the user about a material change.
