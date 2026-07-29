---
description: Generate diverse options, filter by rubric, and return the strongest choices
---

Generate and filter options for a scoped idea, clarified design space, test strategy, naming problem, implementation approach, research direction, or evaluation rubric.

Request:

$@

Use this only for a nontrivial request where independent candidate generation and ranking materially improve the result. Answer small or obvious option, idea, test-case, naming, comparison, or “strongest few” requests directly. When this workflow applies, the goal is not to return everything; it is to create diversity, dedupe, attack weak ideas, and keep the best options.

Entry guard: if the request is still a vague idea, new behavior, design/placement question, or unclear product/workflow decision, route through `brainstorming` first. Return to this recipe only after the target, constraints, and rough selection rubric are clear enough for independent option generation.

Runtime policy:

- Use the `subagent` tool with fresh context unless I explicitly ask for forked context.
- Set `async: true` and retain the run ID. Yield only after the required `pi-subagents` pre-yield Reflection scan finds no qualifying work or meaningful child interaction; the completion notification resumes the parent.
- Do not synthesize the recommendation until the chain completes and its final outputs are inspected.
- Before launching children, hydrate the request: read/fetch any referenced file, diff, URL, issue, PR, plan, log, screenshot, or quoted claim enough to name the concrete scope.
- Include that concrete scope and any relevant paths/links in every child task.
- Do not ask children to edit files.
- The parent owns final selection and should preserve real tradeoffs.
- Once the entry guard is satisfied, do not satisfy this prompt by brainstorming alone when subagents are available; the value comes from independent generators and a filtering pass.
- Do not run scout-only fanout for this workflow.
- If local repo constraints matter, add at most one bounded `scout` role with a concrete local target, while retaining option generators and the reviewer/filter pass.
- Use `output: false` and `progress: false` only for concise advisory passes whose returned inline text the parent or next chain step will inspect.
- If the user says `no repo artifacts`, `no project artifacts`, or `don't write .scratch files`, also set top-level `artifacts: false`.
- If the user says strict `do not write artifacts`, `no files`, or `inline only`, do not launch subagents; answer parent-only or ask to relax the constraint.
- If output artifacts are useful, large, or durable and allowed, set an explicit output path and `outputMode: "file-only"`; use an absolute path when the artifact must land in a specific repo `.scratch/` directory.
- For foreground tool-call chain steps, relative outputs are chain-artifact-local; for top-level `tasks`, relative outputs resolve against `cwd`; slash-command background `/chain` relative outputs resolve against cwd or the step cwd.
- When a downstream reducer receives file-only references through `{previous}`, its task must explicitly read those referenced artifact paths before filtering or synthesis.
- Every child task should include this compact stop contract: Do not stop to save cost; continue while additional evidence could materially improve the deliverable. If missing tools, access, or context prevents completion, report the blocking reason and smallest missing next step; reviewer children return `INCONCLUSIVE`. Do not broaden scope or make approval-required decisions.
- For researcher children, include a research depth contract: Do not cap searches or sources to save cost. Pursue primary sources, counterevidence, and follow-up searches while new evidence could materially change the conclusion; stop only when findings are saturated or blocked.

Protocol:

1. Generate diverse candidates.
   Size parallel `delegate`/`researcher` generators from genuinely distinct assumptions and evidence gaps. One or two are allowed only when no useful third perspective exists and the parent states why. Use at most one bounded `scout` when local constraints matter. Practical, ambitious, and simplifying perspectives are candidates when credible, not mandatory roles.

2. Filter and dedupe.
   For a nontrivial option review, use the canonical initial-review fanout over the concrete generated options. Give each reviewer/filter the decision contract, non-goals, relevant decisions, rubric/evidence, assigned filter angle, and stop condition. They remove duplicates, reject low-evidence ideas, rank by rubric, identify counterarguments, use the three finding partitions, and never edit. Parent synthesis follows; do not stop after generation.

3. Deepen only when warranted.
   Follow the second-wave rule in `pi-subagents` under **Review fanout, packets, and reduction**: launch another targeted read-only swarm only when the shortlist exposes a named new evidence angle, such as deeper attack, local feasibility, external evidence, or validation design. Do not repeat broad generation.

4. Return top choices.
   Return a small set with pros, cons, risks, and next validation step.

After the applicability and entry guards are satisfied, use runtime chain fan-out/fan-in so the canonical initial-review fanout sees the concrete generated options. Generator-only fanout is incomplete. If the nontrivial filter review cannot run, return `INCONCLUSIVE` with the blocking reason.

```typescript
subagent({
  chain: [
    {
      parallel: selectedGeneratorAngles.map((angle) => ({
        agent: angle.agent,
        task: `Generate ${angle.name} options for <request> from ${angle.assumption}. Return evidence and tradeoffs; never edit. Stop when ${angle.stopCondition}.`,
        output: false,
        progress: false,
      })),
      concurrency: selectedGeneratorAngles.length,
    },
    {
      parallel: selectedFilterAngles.map((angle) => ({
        agent: "reviewer",
        task: `Filter generated options in {previous} for ${angle.name}. Decision contract: <contract>. Non-goals: <non-goals>. Rubric/evidence: <rubric>. Dedupe/rank using ${angle.evidenceTarget}; return the three finding partitions; never edit. Stop when ${angle.stopCondition}.`,
        output: false,
        progress: false,
      })),
      concurrency: selectedFilterAngles.length,
    },
  ],
  context: "fresh",
  async: true,
});
```

Adapt agents to the request:

- Use `researcher` when external examples, names, docs, benchmarks, or market/ecosystem context matter.
- Use `scout` when options depend on local repository structure, tests, or implementation constraints.
- Use `reviewer` for critique, rubric building, dedupe, and ranking.

For nontrivial work, `selectedFilterAngles` satisfies the canonical initial-review fanout with genuinely distinct entries. After completion, inspect every chain result/artifact and validate filter claims before parent synthesis. Parent synthesis must include:

- rubric used;
- the smallest strongest option set that preserves materially different tradeoffs, unless I ask for a specific count;
- rejected categories or duplicates;
- strongest counterargument to the recommended option;
- recommended next validation step.

Do not pick a material winner silently: present previous behavior, recommendation, and tradeoff, then ask the user.
