export type AgentSource = 'claude' | 'openclaw' | 'copilot-cli' | 'unknown';

export interface SourceInfo {
  source: AgentSource;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
}

const SOURCE_INFO_MAP: Record<AgentSource, SourceInfo> = {
  claude: {
    source: 'claude',
    label: 'Claude Code',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500',
    icon: '🤖',
  },
  openclaw: {
    source: 'openclaw',
    label: 'OpenClaw',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500',
    icon: '🦀',
  },
  'copilot-cli': {
    source: 'copilot-cli',
    label: 'Copilot CLI',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500',
    icon: '🚀',
  },
  unknown: {
    source: 'unknown',
    label: 'Unknown',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500',
    icon: '❓',
  },
};

export function detectAgentSource(agent: {
  source?: string;
  name?: string;
  uuid?: string;
  id?: string | number;
}): AgentSource {
  // Direct source match first
  if (agent.source) {
    const s = agent.source.toLowerCase();
    if (s === 'claude' || s === 'openclaw' || s === 'copilot-cli') {
      return s;
    }
  }

  const combined = [
    agent.source ?? '',
    agent.name ?? '',
    agent.uuid ?? '',
    String(agent.id ?? ''),
  ]
    .join(' ')
    .toLowerCase();

  if (combined.includes('openclaw') || combined.includes('claw')) return 'openclaw';
  if (combined.includes('claude')) return 'claude';
  if (combined.includes('copilot') || combined.includes('github')) return 'copilot-cli';

  return 'unknown';
}

export function getSourceInfo(source: AgentSource): SourceInfo {
  return SOURCE_INFO_MAP[source] ?? SOURCE_INFO_MAP.unknown;
}
