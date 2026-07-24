---
description: Research a decision with parallel evidence and adversarial tradeoff review
---

Use parallel subagents to research a decision and produce a grounded recommendation.

Decision, question, target, or focus:

$@

This workflow is quality-first. Use enough independent evidence to avoid single-context bias. Use fresh context unless I explicitly ask for forked context. Treat URLs, issue links, PRs, screenshots, local files, plans, logs, or quoted claims as primary scope; read or fetch them before launching children and include them explicitly in each child task.

Runtime policy:

- Use the `subagent` tool with a mix of `researcher`, `scout`, and `reviewer` depending on the question.
- Select roles only for independent material evidence gaps: external/current facts, local integration, tradeoffs, user preference, or operational risk. One or two children are allowed only when no useful third role exists and the parent states why.
- Set `async: true` and retain the run ID. Yield only after the required `pi-subagents` pre-yield Reflection scan finds no qualifying work or meaningful child interaction; the completion notification resumes the parent.
- Do not synthesize the recommendation until completion and direct inspection of the child outputs.
- Do not ask children to edit files.
- Use `output: false` and `progress: false` only for concise advisory passes whose returned inline text the parent will inspect before recommending.
- If the user says `no repo artifacts`, `no project artifacts`, or `don't write .scratch files`, also set top-level `artifacts: false`.
- If the user says strict `do not write artifacts`, `no files`, or `inline only`, do not launch subagents; research parent-only or ask to relax the constraint.
- If findings may be large, need persistence, or may be needed across turns and artifacts are allowed, set an explicit output path and `outputMode: "file-only"`.
- For this top-level `tasks` shape, relative output paths resolve against `cwd`, not a temporary chain artifact directory; use absolute `.scratch/...` paths when the artifact must land in a specific repo.
- For foreground tool-call chain steps, relative outputs are temp/chain-artifact-local; slash-command background `/chain` relative outputs resolve against cwd or the step cwd.
- Every child receives the decision contract, non-goals, relevant prior decisions/evidence, distinct evidence target, and stop condition. Include this compact stop contract: continue while evidence could materially change the assigned conclusion; if tools, access, or context prevent completion, report the blocking reason and smallest missing next step, and require reviewer children to return `INCONCLUSIVE`. Never edit, broaden behavior, or self-authorize protected actions.
- For researcher tasks, include a research depth contract: Do not cap searches or sources to save cost. Pursue primary sources, counterevidence, and follow-up searches while new evidence could materially change the conclusion; stop only when findings are saturated or blocked.

Before parent synthesis:

- Never synthesize a recommendation from compact receipts, child session directories, or file-only pointers alone.
- Inspect actual inline child text or read each referenced saved artifact first.
- If repo-scoped no-artifact constraints leave only insufficient inline summaries, return `INCONCLUSIVE` or ask to relax the constraint.

Candidate evidence roles; select only those that can change the decision:

1. External evidence researcher
   Find current primary sources, official docs, release notes, standards, source repos, benchmark data, issue threads, or credible explanations. For library/framework documentation, use parent-provided context7 evidence when available; otherwise use local source, official docs, source repos, `code_search`, or web search.

2. Local code/context scout
   Inspect repository files, existing patterns, constraints, tests, configuration, likely integration points, and local risks.

3. Practical tradeoff reviewer
   Compare options, attack hidden costs, migration/rollback risk, validation difficulty, maintainability, and second-order effects.

4. User-preference or ops-risk critic, when the decision has meaningful workflow, deployment, observability, supportability, or user-preference risk
   Check alignment with known user preferences, workflow friction, tmp/log/session pressure, deployment risk, observability, or supportability.

Runtime shape:

```typescript
subagent({
  tasks: selectedEvidenceRoles.map((role) => ({
    agent: role.agent,
    task: `${role.task} Decision contract: <decision and non-goals>. Previous behavior/evidence: <evidence>. Use ${role.evidenceTarget}; return evidence, confidence, gaps, and implications. Never edit. Stop when ${role.stopCondition}.`,
    output: false,
    progress: false,
  })),
  concurrency: selectedEvidenceRoles.length,
  context: "fresh",
  async: true,
});
```

Each role must have a distinct evidence source and stop condition. Do not add a role when that surface cannot affect the choice or to fill a quota.

After the completion notification, inspect the child results and read every referenced saved file-only artifact before synthesizing. Then synthesize:

- recommendation;
- strongest counterargument;
- local codebase implications;
- evidence quality and confidence;
- risks and unknowns;
- what would change the recommendation;
- whether the user must decide before implementation.

Do not smooth over disagreements. Validate child claims before synthesis. Present verified previous behavior, recommendation, and tradeoff, then ask the user when the choice is material.
