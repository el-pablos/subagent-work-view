import { cn } from "../../lib/utils";

export type SourceType = "claude" | "openclaw" | "unknown";

export interface SourceBadgeProps {
  source: SourceType;
  size?: "sm" | "md";
  className?: string;
}

const sourceConfig: Record<
  SourceType,
  { label: string; color: string }
> = {
  claude: {
    label: "Claude",
    color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
  },
  openclaw: {
    label: "OpenClaw",
    color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  },
  unknown: {
    label: "Unknown",
    color: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  },
};

export function SourceBadge({
  source,
  size = "sm",
  className,
}: SourceBadgeProps) {
  const config = sourceConfig[source] || sourceConfig.unknown;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-0.5 text-[10px]",
        config.color,
        className,
      )}
    >
      {config.label}
    </span>
  );
}
