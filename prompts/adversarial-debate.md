---
description: Adversarial debate workflow with proposals, attacks, and parent synthesis
---

Run an adversarial debate on a decision, design, plan, claim, implementation direction, or ambiguous problem.

Debate target:

$@

This workflow exists to make agents fight the framing instead of converging politely. Use it when the problem is ambiguous, high-impact, architecture/product/security-relevant, or when the parent agent may be anchoring on its own plan.

Use the `subagent` tool with fresh context unless I explicitly ask for forked context. Before launching children, hydrate the target: read/fetch the referenced file, diff, URL, issue, PR, plan, log, screenshot, or quoted claim enough to name the concrete scope. Include that concrete target and any relevant paths/links in every child task. Do not ask children to edit files. The parent owns final synthesis and user-facing decisions. Do not satisfy this prompt with a single inline pro/con list when subagents are available; the value comes from independent proposals and adversarial attacks. Use `output: false` for concise advisory passes. If output artifacts are useful, set an explicit output path and `outputMode: "file-only"`; use an absolute path when the artifact must land in a specific repo `.scratch/` directory. For foreground tool-call chain steps, relative outputs are chain-artifact-local; for top-level `tasks`, relative outputs resolve against `cwd`; slash-command background `/chain` relative outputs resolve against cwd or the step cwd.

Protocol:

1. Independent proposals or positions.
   Size generator fanout from genuinely distinct assumptions and evidence gaps; do not force a minimum/maximum. One or two are allowed only when no useful third perspective exists and the parent states why. Obvious, simpler/smaller, and materially different alternatives are candidates when credible.

2. Adversarial attacks.
   For nontrivial debate review, use the canonical initial-review fanout with skeptical fresh reviewers and distinct evidence targets to attack the strongest proposals, the parent's framing, and hidden requirements. Give them the decision contract, non-goals, relevant decisions, proposal artifacts/evidence, angle, and stop condition. Reviewers never edit and use the three finding partitions.

3. Optional rebuttal/repair.
   If disagreement is sharp and useful, ask a child or the parent to repair the best proposal against the strongest objections.

4. Parent synthesis.
   Validate findings and compare conflicts by rubric, surface the strongest counterargument, and reject weak claims. Ask the user when a material decision remains.

Required quick runtime shape when subagents are available: use runtime chain fan-out/fan-in so the attack pass sees concrete proposal output. Saved `.chain.md` files are sequential-only today, so use the `chain` array directly:

```typescript
subagent({
  chain: [
    {
      parallel: selectedProposalAngles.map((angle) => ({
        agent: angle.agent,
        task: `Develop ${angle.name} for <target> from ${angle.assumption}. Return evidence and tradeoffs; never edit. Stop when ${angle.stopCondition}.`,
        output: `adversarial-debate-${angle.name}.md`,
        outputMode: "file-only",
        progress: false,
      })),
      concurrency: selectedProposalAngles.length,
    },
    {
      parallel: selectedAttackAngles.map((angle) => ({
        agent: "reviewer",
        task: `Read the proposal artifacts in {previous}. Decision contract: <contract>. Non-goals: <non-goals>. Evidence: <evidence>. Attack ${angle.name} using ${angle.evidenceTarget}; return the three finding partitions; never edit. Stop when ${angle.stopCondition}.`,
        output: `adversarial-debate-attack-${angle.name}.md`,
        outputMode: "file-only",
        progress: false,
      })),
      concurrency: selectedAttackAngles.length,
    },
  ],
  context: "fresh",
  async: true,
});
```

Before launch, ensure a nontrivial attack pass satisfies the canonical initial-review fanout with genuinely distinct entries. Before parent synthesis, read every saved artifact, validate reviewer claims for reachability/impact/proof, and preserve the three finding partitions. Parent synthesis rubric:

- Which proposal best satisfies the explicit goal?
- Which proposal is simplest without losing required behavior?
- Which risks are proven versus speculative?
- What is the strongest counterargument to the preferred path?
- What evidence is missing?
- Which choice requires user approval?
- What is the next bounded action?

Do not declare consensus just because children overlap. Preserve real disagreement and state why you choose, defer, or ask.
