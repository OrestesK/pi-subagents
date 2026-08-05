import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { AgentConfig } from "../../src/agents/agents.ts";
import { validateCapabilityRequirements } from "../../src/runs/shared/capability-requirements.ts";

const researcher: AgentConfig = { name: "researcher", description: "Researcher", systemPromptMode: "replace", inheritProjectContext: false, inheritSkills: false, systemPrompt: "", source: "builtin", filePath: "researcher.md" };

describe("capability requirements", () => {
	it("checks capabilities after applying per-task tool extensions", () => {
		const error = validateCapabilityRequirements({ tasks: [{ agent: "researcher", requiresCapabilities: ["mcp"], toolExtensions: { add: ["mcp"] } }] }, [researcher], { toolExtensions: { mcp: { description: "Regular MCP access", builtinTools: ["mcp"], allowedAgents: ["researcher"] } } });
		assert.equal(error, undefined);
	});

	it("rejects an unsatisfied declared capability", () => {
		assert.match(validateCapabilityRequirements({ agent: "researcher", requiresCapabilities: ["mcp"] }, [researcher]) ?? "", /Capability mismatch/);
	});

	it("requires a declared custom extension rather than default extension loading", () => {
		assert.match(validateCapabilityRequirements({ agent: "researcher", requiresCapabilities: ["custom-extension"] }, [researcher]) ?? "", /Capability mismatch/);
		assert.equal(validateCapabilityRequirements({ agent: "researcher", requiresCapabilities: ["custom-extension"] }, [{ ...researcher, extensions: ["/extensions/custom.ts"] }]), undefined);
		assert.equal(validateCapabilityRequirements({ agent: "researcher", requiresCapabilities: ["custom-extension"] }, [{ ...researcher, tools: ["./extensions/custom.ts"] }]), undefined);
	});

	it("rejects a capability declared on a chain wrapper without an agent", () => {
		const error = validateCapabilityRequirements({
			chain: [{
				requiresCapabilities: ["mcp"],
				parallel: [{ agent: "researcher" }],
			} as never],
		}, [researcher]);
		assert.match(error ?? "", /must be attached to a concrete agent-bearing task/);
	});
});
