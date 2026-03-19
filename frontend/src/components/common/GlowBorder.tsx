import { type ReactNode } from "react";
import { cn } from "../../lib/utils";

interface GlowBorderProps {
  children: ReactNode;
  color?: "cyan" | "purple" | "emerald" | "amber" | "red";
  intensity?: "low" | "medium" | "high";
  animated?: boolean;
  className?: string;
}

const glowColors = {
  cyan: {
    border: "border-cyan-500/30",
    shadow: "shadow-cyan-500/10",
    gradient: "from-cyan-500/20 via-transparent to-cyan-500/20",
  },
  purple: {
    border: "border-purple-500/30",
    shadow: "shadow-purple-500/10",
    gradient: "from-purple-500/20 via-transparent to-purple-500/20",
  },
  emerald: {
    border: "border-emerald-500/30",
    shadow: "shadow-emerald-500/10",
    gradient: "from-emerald-500/20 via-transparent to-emerald-500/20",
  },
  amber: {
    border: "border-amber-500/30",
    shadow: "shadow-amber-500/10",
    gradient: "from-amber-500/20 via-transparent to-amber-500/20",
  },
  red: {
    border: "border-red-500/30",
    shadow: "shadow-red-500/10",
    gradient: "from-red-500/20 via-transparent to-red-500/20",
  },
} as const;

export function GlowBorder({
  children,
  color = "cyan",
  intensity = "medium",
  animated = false,
  className,
}: GlowBorderProps) {
  const config = glowColors[color];

  return (
    <div className={cn("group relative rounded-xl", className)}>
      <div
        aria-hidden="true"
        className={cn(
          "absolute -inset-0.5 rounded-xl bg-gradient-to-r opacity-0 blur-sm transition-opacity duration-500 group-hover:opacity-100",
          config.gradient,
          animated && "animate-pulse",
          intensity === "high" && "opacity-50 group-hover:opacity-100",
          intensity === "medium" && "opacity-0 group-hover:opacity-75",
          intensity === "low" && "opacity-0 group-hover:opacity-50",
        )}
      />
      <div
        className={cn(
          "relative rounded-xl border shadow-lg",
          config.border,
          config.shadow,
        )}
      >
        {children}
      </div>
    </div>
  );
}
