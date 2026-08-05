import assert from "node:assert/strict";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";
import { handleList } from "../../src/agents/agent-management.ts";

let tempHome = "";
let tempProject = "";
let agentDir = "";
const originalHome = process.env.HOME;
const originalUserProfile = process.env.USERPROFILE;
const originalPiCodingAgentDir = process.env.PI_CODING_AGENT_DIR;

function writeJson(filePath: string, value: unknown): void {
	fs.mkdirSync(path.dirname(filePath), { recursive: true });
	fs.writeFileSync(filePath, JSON.stringify(value, null, 2), "utf-8");
}

function writeAgent(dir: string, name: string, description: string): void {
	fs.mkdirSync(dir, { recursive: true });
	fs.writeFileSync(
		path.join(dir, `${name}.md`),
		`---\nname: ${name}\ndescription: ${description}\n---\nAgent prompt.\n`,
		"utf-8",
	);
}

function readText(result: ReturnType<typeof handleList>): string {
	const first = result.content[0];
	assert.ok(first);
	assert.equal(first.type, "text");
	assert.equal(typeof first.text, "string");
	return first.text;
}

function listText(agentScope: "both" | "user" | "project" = "both"): string {
	return readText(handleList(
		{ action: "list", agentScope },
		{ cwd: tempProject, modelRegistry: { getAvailable: () => [] } } as never,
	));
}

describe("agent management routing list", () => {
	beforeEach(() => {
		tempHome = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagents-list-home-"));
		tempProject = fs.mkdtempSync(path.join(os.tmpdir(), "pi-subagents-list-project-"));
		agentDir = path.join(tempHome, "agent");
		fs.mkdirSync(path.join(tempProject, ".pi"), { recursive: true });
		process.env.HOME = tempHome;
		process.env.USERPROFILE = tempHome;
		process.env.PI_CODING_AGENT_DIR = agentDir;
	});

	afterEach(() => {
		if (originalHome === undefined) delete process.env.HOME;
		else process.env.HOME = originalHome;
		if (originalUserProfile === undefined) delete process.env.USERPROFILE;
		else process.env.USERPROFILE = originalUserProfile;
		if (originalPiCodingAgentDir === undefined) delete process.env.PI_CODING_AGENT_DIR;
		else process.env.PI_CODING_AGENT_DIR = originalPiCodingAgentDir;
		fs.rmSync(tempHome, { recursive: true, force: true });
		fs.rmSync(tempProject, { recursive: true, force: true });
	});

	it("prints effective agents and the approved routing contract", () => {
		writeAgent(path.join(agentDir, "agents"), "general-purpose", "Flexible custom tasks");

		const text = listText();

		assert.match(text, /Agents \(effective; default context: fresh\):/);
		assert.match(text, /- scout — Use for fast read-only codebase recon/);
		assert.match(text, /- reviewer — Use for read-only review/);
		assert.match(text, /- general-purpose — Use when this custom agent fits: Flexible custom tasks/);

		assert.match(text, /Context:/);
		assert.match(text, /fresh = independent child session, not the parent conversation history/);
		assert.match(text, /fork = inherits the parent conversation context/);

		assert.match(text, /Tool access:/);
		assert.match(text, /Tools are agent-specific, not inherited from the parent/);
		assert.match(text, /use clone as the bounded task owner for writes/);
		assert.match(text, /configured non-advisory agent when MCP, direct MCP, or custom-extension tools are explicitly required/);

		assert.match(text, /Route selection:/);
		assert.match(text, /Atomic focused task: launch the matching specialist directly/);
		assert.match(text, /Bounded multi-step task: clone owns chain\/fanout work and returns a complete result/);
		assert.match(text, /Independent top-level tasks: run clones and specialists in parallel; parent synthesizes/);

		assert.match(text, /Execution:/);
		assert.match(text, /SINGLE: \{ agent, task\? \}/);
		assert.match(text, /PARALLEL: \{ tasks: \[\.\.\.\] \}/);
		assert.match(text, /CHAIN: \{ chain: \[\.\.\.\] \}/);
		assert.match(text, /Details\/provenance\/tools: use \{ action: "get", agent: "name" \}/);
		assert.doesNotMatch(text, /Builtin workflows|builtin\.(?:quality-gate|research-decision|generate-filter)/);
		assert.doesNotMatch(text, /^- WORKFLOW:/m);

		assert.match(text, /Saved chains \(\.chain\.md\):/);
		assert.match(text, new RegExp(`user location: ${agentDir.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[/\\\\]chains`));
		assert.match(text, new RegExp(`project location: ${tempProject.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[/\\\\]\\.pi[/\\\\]chains`));
	});

	it("lists configured tool-extension bundles with routing constraints", () => {
		const text = readText(handleList(
			{ action: "list" },
			{
				cwd: tempProject,
				modelRegistry: { getAvailable: () => [] },
				config: {
					toolExtensions: {
						mcp: {
							description: "Regular MCP access",
							builtinTools: ["mcp"],
							allowedAgents: ["researcher", "scout"],
						},
					},
				},
			} as never,
		));

		assert.match(text, /Tool extensions:/);
		assert.match(text, /- mcp \(researcher, scout\): Regular MCP access/);
	});

	it("uses effective discovery for precedence, scope, disabled agents, and diagnostics", () => {
		writeAgent(path.join(agentDir, "agents"), "shared", "User helper");
		writeAgent(path.join(tempProject, ".pi", "agents"), "shared", "Project helper");
		writeAgent(path.join(agentDir, "agents"), "user-only", "User-only helper");
		writeAgent(path.join(tempProject, ".pi", "agents"), "project-only", "Project-only helper");
		writeJson(path.join(agentDir, "settings.json"), {
			subagents: { agentOverrides: { reviewer: { disabled: true } } },
		});
		fs.mkdirSync(path.join(tempProject, ".pi", "chains"), { recursive: true });
		fs.writeFileSync(path.join(tempProject, ".pi", "chains", "broken.chain.json"), "{", "utf-8");

		const both = listText();
		assert.match(both, /^- shared — Use when this custom agent fits: Project helper$/m);
		assert.doesNotMatch(both, /User helper/);
		assert.doesNotMatch(both, /^- reviewer\b/m);
		assert.match(both, /Chain diagnostics:/);
		assert.match(both, /broken\.chain\.json/);
		assert.match(both, /Invalid JSON chain/);

		const user = listText("user");
		assert.match(user, /^- user-only — Use when this custom agent fits: User-only helper$/m);
		assert.doesNotMatch(user, /^- project-only\b/m);

		const project = listText("project");
		assert.doesNotMatch(project, /^- user-only\b/m);
		assert.match(project, /^- project-only — Use when this custom agent fits: Project-only helper$/m);
	});
});
