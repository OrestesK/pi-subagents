import type { Message } from "@earendil-works/pi-ai";
import { isMutatingBashCommand } from "./long-running-guard.ts";
import { expectsImplementationMutation } from "./task-intent.ts";

export { expectsImplementationMutation };

const READ_ONLY_BUILTIN_TOOLS = new Set([
	"read",
	"grep",
	"find",
	"ls",
	"web_search",
	"fetch_content",
	"get_search_content",
	"intercom",
	"contact_supervisor",
]);

interface CompletionMutationGuardInput {
	agent: string;
	task: string;
	messages: Message[];
	tools?: string[];
	mcpDirectTools?: string[];
}

interface CompletionMutationGuardResult {
	expectedMutation: boolean;
	attemptedMutation: boolean;
	triggered: boolean;
}

const RUN_MONITOR_TERMINAL_STATES = new Set(["completed", "failed", "missing", "stuck", "timed_out"]);

export function hasMutationToolCapability(tools: string[] | undefined, mcpDirectTools: string[] | undefined): boolean {
	if (tools === undefined || tools.length === 0 || (mcpDirectTools?.length ?? 0) > 0) return true;
	return !tools.every((tool) => READ_ONLY_BUILTIN_TOOLS.has(tool));
}

export function hasMutationToolCall(messages: Message[]): boolean {
	for (const message of messages) {
		if (message.role !== "assistant") continue;
		for (const part of message.content) {
			if (part.type !== "toolCall") continue;
			if (part.name === "edit" || part.name === "write") return true;
			if (part.name !== "bash") continue;
			const args = typeof part.arguments === "object" && part.arguments !== null && !Array.isArray(part.arguments)
				? part.arguments as Record<string, unknown>
				: {};
			if (typeof args.command === "string" && isMutatingBashCommand(args.command)) return true;
		}
	}
	return false;
}

export function runMonitorCompletionError(agent: string, output: string): string | undefined {
	if (agent !== "run-monitor") return undefined;

	let state: string | undefined;
	let nextParentAction: string | undefined;
	for (const match of output.matchAll(/^\s*-\s*(?:\*\*)?(state|final[ _]state|next_parent_action)(?::)?(?:\*\*)?:?\s*(?:\*\*|`)?([a-z_]+)(?:\*\*|`)?\s*$/gim)) {
		const field = match[1]?.toLowerCase().replace(" ", "_");
		const value = match[2]?.toLowerCase();
		if (field === "state" || field === "final_state") state = value;
		else nextParentAction = value;
	}

	if (!state) {
		return "Run-monitor exited without the required final state. It must report a documented terminal state.";
	}
	if (!RUN_MONITOR_TERMINAL_STATES.has(state)) {
		return `Run-monitor exited with nonterminal state '${state}'. It must continue until the target reaches a terminal state.`;
	}
	if (nextParentAction === "continue_waiting") {
		return "Run-monitor exited with nonterminal next_parent_action 'continue_waiting'. It must continue until no further monitoring is required.";
	}
	return undefined;
}

export function evaluateCompletionMutationGuard(input: CompletionMutationGuardInput): CompletionMutationGuardResult {
	const expectedMutation = hasMutationToolCapability(input.tools, input.mcpDirectTools)
		? expectsImplementationMutation(input.agent, input.task)
		: false;
	const attemptedMutation = hasMutationToolCall(input.messages);
	return {
		expectedMutation,
		attemptedMutation,
		triggered: expectedMutation && !attemptedMutation,
	};
}
