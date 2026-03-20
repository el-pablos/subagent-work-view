export type AgentSource = "claude" | "openclaw" | "copilot-cli" | "unknown";

export interface SourceInfo {
  source: AgentSource;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const SOURCE_INFO_MAP: Record<AgentSource, SourceInfo> = {
  claude: {
    source: "claude",
    label: "Claude Code",
    color: "text-blue-400",
    bgColor: "bg-blue-500",
    icon: "🤖",
  },
  openclaw: {
    source: "openclaw",
    label: "OpenClaw",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500",
    icon: "🦀",
  },
  "copilot-cli": {
    source: "copilot-cli",
    label: "Copilot CLI",
    color: "text-purple-400",
    bgColor: "bg-purple-500",
    icon: "🚀",
  },
  unknown: {
    source: "unknown",
    label: "Unknown",
    color: "text-slate-400",
    bgColor: "bg-slate-500",
    icon: "❓",
  },
};

export function detectAgentSource(agent: {
  source?: string;
  name?: string;
  uuid?: string;
  id?: string | number;
  external_id?: string | null;
  type?: string;
}): AgentSource {
  // Direct source match first
  if (agent.source) {
    const s = agent.source.toLowerCase();
    if (s === "claude" || s === "openclaw" || s === "copilot-cli") {
      return s;
    }
  }

  // Build combined string from all possible identifier fields
  const combined = [
    agent.source ?? "",
    agent.name ?? "",
    agent.uuid ?? "",
    agent.external_id ?? "",
    agent.type ?? "",
    String(agent.id ?? ""),
  ]
    .join(" ")
    .toLowerCase();

  // OpenClaw detection patterns
  if (
    combined.includes("openclaw") ||
    combined.includes("open-claw") ||
    combined.includes("claw") ||
    combined.includes("rust") ||
    // external_id patterns for OpenClaw
    /claw-[a-z0-9-]+/.test(combined) ||
    /openclaw_/.test(combined)
  ) {
    return "openclaw";
  }

  // Claude Code detection patterns
  if (
    combined.includes("claude") ||
    combined.includes("anthropic") ||
    // external_id patterns for Claude
    /claude-[a-z0-9-]+/.test(combined) ||
    /claude_code/.test(combined) ||
    /cc-[a-z0-9-]+/.test(combined)
  ) {
    return "claude";
  }

  // GitHub Copilot CLI detection patterns
  if (
    combined.includes("copilot") ||
    combined.includes("github") ||
    combined.includes("gh-cli") ||
    // external_id patterns for Copilot
    /copilot-[a-z0-9-]+/.test(combined) ||
    /gh_copilot/.test(combined) ||
    /ghc-[a-z0-9-]+/.test(combined)
  ) {
    return "copilot-cli";
  }

  // Fallback: try to detect from agent type if it matches a known pattern
  const agentType = agent.type?.toLowerCase() ?? "";
  if (agentType) {
    if (agentType.includes("claude") || agentType.includes("anthropic")) {
      return "claude";
    }
    if (agentType.includes("claw") || agentType.includes("rust")) {
      return "openclaw";
    }
    if (agentType.includes("copilot") || agentType.includes("github")) {
      return "copilot-cli";
    }
  }

  return "unknown";
}

export function getSourceInfo(source: AgentSource): SourceInfo {
  return SOURCE_INFO_MAP[source] ?? SOURCE_INFO_MAP.unknown;
}
