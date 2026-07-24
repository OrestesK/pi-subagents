---
description: Quality gate with adversarial parallel review
---

Run a quality gate on the current answer, plan, diff, PR, issue, or target.

Primary target or focus:

$@

This workflow is quality-first. Do not avoid useful reviewers merely to save cost. Use fresh context unless I explicitly ask for forked context. Before launching children, hydrate the target: read/fetch the referenced file, diff, URL, issue, PR, plan, log, screenshot, or quoted claim enough to name the concrete scope. Include that concrete target and any relevant paths/links in every child task. The child reviewers should inspect the target directly from files, diffs, linked sources, commands, or fetched content; they must not rely on the main conversation history.

Runtime policy:

- Use the `subagent` tool with parallel fresh-context reviewers.
- Set `async: true` and retain the run ID. Yield only after the required `pi-subagents` pre-yield Reflection scan finds no qualifying work or meaningful child interaction; the completion notification resumes the parent.
- Do not emit the verdict until completion and direct inspection of the reviewer outputs.
- If the user says `no repo artifacts`, `no project artifacts`, or `don't write .scratch files`, also set top-level `artifacts: false` and keep every child `output: false` and `progress: false`.
- If the user says strict `do not write artifacts`, `no files`, or `inline only`, do not launch subagents; gate parent-only or ask to relax the constraint.
- For a nontrivial gate, select at least three genuinely distinct material review angles; add a specialist only for another concrete attack surface.
- Do not spawn duplicate vague reviewers or create findings to fill the minimum.
- For broader grouped gates or missing-evidence follow-ups, follow the second-wave rule in `pi-subagents` under **Review fanout, packets, and reduction**: name the new evidence angle before launching another targeted read-only swarm.
- Every reviewer receives the approved behavior, non-goals, relevant decisions, actual target, required proof and available evidence, assigned angle/evidence target, and stop condition. Include this compact stop contract: continue while additional evidence could materially change the assigned verdict; if access, context, or tooling prevents responsible judgment, return `INCONCLUSIVE` with the blocking reason and smallest missing next step. Never edit, broaden behavior, or make approval-required decisions.

Before emitting the verdict:

- Inspect the actual returned inline reviewer text or read every referenced saved artifact.
- Remember that `output: false` means no saved file output, not no evidence requirement.
- If reviewer findings are too large or too compact to inspect inline, use distinct saved outputs with `outputMode: "file-only"` when artifacts are allowed.
- Under repo-scoped no-artifact constraints, return `INCONCLUSIVE` or ask to relax the constraint instead of synthesizing from receipts or session directories alone.

Select angles from the actual target and missing evidence. Common candidates include:

- **Correctness/regression:** whether the target satisfies the request and preserves behavior across reachable states.
- **Behavioral proof:** whether the selected test, characterization, reproduction, integration/live/manual evidence, diagnostics, or build checks actually prove the claim and are fresh.
- **Simplicity/ownership:** concrete accidental complexity, duplication, brittle ownership, or misleading structure affecting the approved behavior. Do not actively hunt optional cleanup unless explicitly assigned as primary.

Add these only when relevant:

- Security/privacy adversary for auth, permissions, secrets, data exposure, untrusted input/output, or destructive actions.
- Ops/resource adversary for tmp/log/session pressure, concurrency, cloud resources, migrations, deploy risk, rollback, or observability.
- User-preference/adoption adversary for workflow, UX, documentation, or behavior that might violate known user preferences.

Runtime shape:

```typescript
subagent({
  tasks: selectedMaterialAngles.map((angle) => ({
    agent: "reviewer",
    task: `Quality gate ${angle.name} for <target>. Approved behavior: <behavior>. Non-goals: <non-goals>. Decisions: <decisions>. Proof/evidence: <evidence>. Inspect ${angle.evidenceTarget}; use the three finding partitions; never edit. Stop when ${angle.stopCondition}.`,
    output: false,
    progress: false,
  })),
  concurrency: selectedMaterialAngles.length,
  context: "fresh",
  async: true,
});
```

`selectedMaterialAngles` contains at least three entries for a nontrivial gate. Each angle names its evidence target and stop condition; do not create duplicate angles or findings merely to fill the array.

After completion, inspect every reviewer output. Validate candidate findings for scope, producer/reachability, impact, proof, and behavior preservation. Reviewer findings cannot amend the behavioral contract or authorize edits. Synthesize these partitions:

1. primary in-scope required findings;
2. incidental material adjacent risks;
3. incidental optional cleanup/polish;
4. rejected/deferred findings with reason.

Only primary findings block the gate. Incidental findings do not trigger automatic fixes or another loop.

Then emit a structured gate verdict:

```text
Verdict: PASS | FAIL | INCONCLUSIVE
Blocking findings: <count and one-line list>
Evidence inspected: <commands/files/artifacts actually inspected>
Decision: <claim allowed, claim blocked, or more evidence needed>
```

Blocking rule:

- `FAIL` when any accepted must-fix remains, required verification is missing/stale, a reviewer found a real unresolved correctness/security/ops blocker, or the target cannot support the claim being gated.
- `INCONCLUSIVE` when the reviewers lacked access to the target, evidence is incomplete, tool failures prevent inspection, or the parent cannot reconcile contradictory reviewer findings.
- `PASS` only when no accepted must-fix remains, required evidence is fresh enough for the claim, and the parent can state why should-fix/optional findings do not block.

This gate is review and synthesis only. Do not edit, launch a fix worker, or apply fixes from `/quality-gate` itself. If the target needs changes, report validated primary findings against the behavioral contract and the next authorized parent fix workflow. Another implementation file inside the approved behavior is not a scope amendment; new material behavior, architecture, compatibility, dependency, security/data, persistent artifact, or protected action is.
