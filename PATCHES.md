# Local reconstruction overlay

This checkout starts from upstream `pi-subagents` v0.35.1 at `d6e8005e3958adea634bf27c615abac7407aedc4`. It preserves selected observable behavior from the former local line at `c40055035e87f0ad7c447249fa5050f7f1c80423` without copying the old executor, runner, or control stacks.

The package remains authored and licensed by its upstream project. This file records the local overlay and its verification boundary; it does not replace the upstream changelog.

## Retained overlay

### Named builtin-tool bundles and capability preflight

- `config.json` may define `toolExtensions` bundles with `description`, `builtinTools`, and `allowedAgents`
- Per-child `toolExtensions: { add: ["bundle-id"] }` merges approved builtin tools into a derived agent without mutating the discovered agent definition
- The current registry accepts the builtin tool `mcp`; callers cannot pass raw paths, tool names, or transport configuration through the request
- `requiresCapabilities` supports `mcp`, `direct-mcp`, and `custom-extension` and rejects declared unsatisfied requirements before child launch
- Request resolution is wired through foreground and async single, parallel, chain, dynamic-fanout, and append paths
- Async status/results persist the effective tool list so resume/revival keeps the original child capability

### Run-monitor terminal enforcement

- Only `run-monitor` receives specialized terminal-state handling
- Accepted documented terminal states are `completed`, `failed`, `missing`, `stuck`, and `timed_out`
- Missing, unknown, or nonterminal states and `next_parent_action: continue_waiting` are rejected
- A clean foreground nonterminal final response queues a hidden same-session continuation; foreground and background provisional final-drain timers are cancelled when that continuation turn starts
- Real model errors, length/tool-use stops, interruption, stop, timeout, tool availability, structured-output, and other upstream failure owners keep precedence

### Routing-oriented `action:list`

- Uses upstream effective discovery, precedence, disabled filtering, chain diagnostics, and proactive suggestions
- Adds concise routing guidance for fresh/fork context, advisory versus writing ownership, single/parallel/chain selection, configured bundle IDs, saved-chain locations, and the `action:get` detail path
- Does not restore deprecated `workflow: "builtin.*"` aliases or a builtin-workflow list section

### Retryable transport fallback

- Treats retryable WebSocket and `Connection ended` provider failures as model-fallback candidates
- Preserves the upstream child-tool-failure exclusion, so network-flavored tool failures do not rerun the whole task on another model

## Upstream-owned behavior

All other lifecycle, control, wait, steering, resume, interrupt, acceptance, output, status, transcript, notification, artifact, direct-MCP, worktree, discovery, prompt, agent, skill, and package behavior remains owned by upstream v0.35.1 or the effective root Pi configuration.

The reconstruction intentionally does not restore local completion receipt formatting, alternate wait/control state machines, strict explicit-read rejection, broad writer guards, compact repeated-agent labels, prompt/agent policy rewrites, or deprecated workflow aliases.

## Dropped reconstruction candidates

These dispositions belong only in this ledger because neither candidate is deployed product behavior:

- **Physical output alias/collision handling:** dropped after source inspection showed the local helper had no runtime importer. Historical tests could not make helper-only code a current consumer
- **Late parallel fan-in/straggler tracking:** dropped after source inspection showed no runtime importer and the historical test referenced a tracker export that did not exist

Do not describe either candidate in README or CHANGELOG unless a future approved change wires it into a real runtime path.

## Verification boundary

Completed evidence for this reconstruction:

- Focused changed unit tests: 116 passed, 0 failed
- Affected async and foreground integration files after the run-monitor lifecycle correction: 205 passed, 0 failed
- Behavior characterizations: 5 passed, 0 failed
- Pi 0.80.6 direct-tool host probe: extension loaded, steering acknowledged, completion observed, and 0 network attempts

The complete hermetic `npm run test:all` suite passed under Node 22 with `PI_CODING_AGENT_DIR` unset and an isolated process home: 1,300 unit tests passed with 1 skipped; 613 integration tests passed with 2 skipped; and 2 end-to-end tests passed.

## Maintenance rule

Future upstream updates should be evaluated behavior-first. Reapply only a retained overlay whose current consumer and missing upstream outcome are still proven. Do not mechanically replay the former local commit stack.
