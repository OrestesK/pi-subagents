import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readSubagentGuide, SUBAGENT_GUIDE_TOPICS } from "../../src/extension/subagent-guide.ts";
import { SUBAGENT_ACTIONS } from "../../src/shared/types.ts";

describe("subagent guide", () => {
	it("reads the packaged overview by default", () => {
		const guide = readSubagentGuide();

		assert.match(guide, /# pi-subagents/);
	});

	it("lists valid topics for an unknown topic without changing files", () => {
		const guide = readSubagentGuide("unknown");

		assert.match(guide, /Unknown subagents guide topic 'unknown'/);
		assert.match(guide, /No files were changed\./);
		assert.match(guide, new RegExp(SUBAGENT_GUIDE_TOPICS.join(", ")));
	});

	it("registers the guide action for action recovery", () => {
		assert.ok(SUBAGENT_ACTIONS.includes("guide"));
	});

	it("documents external CLI runner limits in packaged guide topics", () => {
		assert.match(readSubagentGuide("tool-reference"), /External CLI agent profiles[\s\S]*native Pi child options[\s\S]*model override[\s\S]*native Pi tools/);
		assert.match(readSubagentGuide("agents"), /External CLI agents use their own runner contract[\s\S]*native Pi child options/);
	});

	it("documents status and resume mechanics while deferring failure policy", () => {
		const workflows = readSubagentGuide("workflows");
		const toolReference = readSubagentGuide("tool-reference");
		for (const guide of [workflows, toolReference]) {
			assert.match(guide, /Inspecting and resuming failed runs/);
			assert.match(guide, /action: "status"[\s\S]*view: "transcript"[\s\S]*action: "debug\.run"/);
			assert.match(guide, /action: "children\.list"[\s\S]*action: "resume"[\s\S]*stored agent\/model\/tool contract/);
			assert.match(guide, /Failure handling and execution-mode authorization belong to the applicable operator and project instructions/);
			assert.match(guide, /compaction abort[\s\S]*already resolved model[\s\S]*model change requires a new explicit launch/);
			assert.match(guide, /external CLI command[\s\S]*separate invocation, not a subagent resume/);
			assert.doesNotMatch(guide, /external\/foreground\/CLI fallback requires explicit owner approval|same-protocol retry/);
		}
		assert.match(workflows, /Shared-checkout writer allocation and isolation requirements come from the applicable operator and project instructions/);
		assert.doesNotMatch(workflows, /Keep one writer when parallel writes are not intentionally isolated/);
	});

	it("keeps advanced workflow details in the packaged guide", () => {
		const guide = readSubagentGuide("workflows");

		assert.match(guide, /### Parallel sequential lanes[\s\S]*runs\.lanes/);
		assert.match(guide, /### Host command steps[\s\S]*runs\.host/);
		assert.match(guide, /### Advanced rolling child runs[\s\S]*Promise\.race[\s\S]*Promise\.all/);
	});
});
