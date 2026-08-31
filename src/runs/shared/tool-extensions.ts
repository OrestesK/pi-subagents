import type { AgentConfig } from "../../agents/agents.ts";
import type {
	ExtensionConfig,
	RequiredCapability,
	ToolExtensionRegistry,
	ToolExtensionRequest,
} from "../../shared/types.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateToolExtensionRegistry(
	registry: unknown,
): asserts registry is ToolExtensionRegistry {
	if (!isRecord(registry)) throw new Error("Malformed tool extension registry.");
	if (Object.keys(registry).some((id) => id !== "mcp")) {
		throw new Error("toolExtensions supports only the 'mcp' bundle.");
	}
	const bundle = registry.mcp;
	if (bundle === undefined) return;
	if (
		!isRecord(bundle)
		|| Object.keys(bundle).some((key) => !["description", "builtinTools", "allowedAgents"].includes(key))
		|| typeof bundle.description !== "string"
		|| !Array.isArray(bundle.builtinTools)
		|| bundle.builtinTools.length !== 1
		|| bundle.builtinTools[0] !== "mcp"
		|| !Array.isArray(bundle.allowedAgents)
	) {
		throw new Error("Malformed tool extension bundle 'mcp'.");
	}
	if (
		bundle.allowedAgents.length === 0
		|| bundle.allowedAgents.some((agent) => typeof agent !== "string" || agent.length === 0)
	) {
		throw new Error("Tool extension bundle 'mcp' allowedAgents must contain at least one agent.");
	}
}

export function resolveToolExtensionAgent(
	agents: readonly AgentConfig[],
	config: ExtensionConfig,
	agentName: string,
	request?: ToolExtensionRequest,
): AgentConfig {
	const baseAgent = agents.find((agent) => agent.name === agentName);
	if (!baseAgent) throw new Error(`Unknown agent '${agentName}'.`);
	if (request === undefined) return baseAgent;
	if (
		!isRecord(request)
		|| Object.keys(request).length !== 1
		|| !Array.isArray(request.add)
		|| request.add.length !== 1
		|| request.add[0] !== "mcp"
	) {
		throw new Error("toolExtensions must be { add: ['mcp'] }.");
	}

	const registry = config.toolExtensions ?? {};
	validateToolExtensionRegistry(registry);
	const bundle = registry.mcp;
	if (!bundle) throw new Error("Unknown tool extension bundle 'mcp'.");
	for (const allowedAgent of bundle.allowedAgents) {
		if (!agents.some((agent) => agent.name === allowedAgent)) {
			throw new Error(`Tool extension bundle 'mcp' references unknown agent '${allowedAgent}'.`);
		}
	}
	if (!bundle.allowedAgents.includes(agentName)) {
		throw new Error(`Agent '${agentName}' is not allowed to use bundle 'mcp'.`);
	}
	if (baseAgent.tools?.includes("mcp")) return baseAgent;
	return { ...baseAgent, tools: [...(baseAgent.tools ?? []), "mcp"] };
}

export function validateRequiredCapabilities(input: {
	required?: RequiredCapability[];
	effectiveTools: readonly string[];
}): void {
	if (input.required === undefined) return;
	if (input.required.length !== 1 || input.required[0] !== "mcp") {
		throw new Error("requiresCapabilities must be ['mcp'].");
	}
	if (!input.effectiveTools.includes("mcp")) {
		throw new Error("Required capability 'mcp' is unavailable after launch restrictions.");
	}
}
