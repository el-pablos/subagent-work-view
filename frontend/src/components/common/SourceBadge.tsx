import { cn } from "../../lib/utils";
import { type AgentSource, getSourceInfo } from "../../lib/sourceDetection";

export type SourceType = AgentSource;

export interface SourceBadgeProps {
  source: SourceType;
  size?: "sm" | "md";
  className?: string;
}

const badgeColors: Record<SourceType, string> = {
  claude: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  openclaw: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  "copilot-cli": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  unknown: "bg-slate-500/20 text-slate-400 border-slate-500/30",
};

export function SourceBadge({
  source,
  size = "sm",
  className,
}: SourceBadgeProps) {
  const info = getSourceInfo(source);
  const color = badgeColors[source] ?? badgeColors.unknown;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        color,
        className,
      )}
    >
      {info.label}
    </span>
  );
}
