import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

function getDimensionStyle(
  width?: string | number,
  height?: string | number,
): CSSProperties | undefined {
  if (width === undefined && height === undefined) {
    return undefined;
  }

  return {
    width,
    height,
  };
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animate = true,
}: SkeletonProps) {
  const dimensionStyle = getDimensionStyle(width, height);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-800/80",
        variant === "text" && "h-4 rounded",
        variant === "circular" && "rounded-full",
        variant === "rectangular" && "rounded-none",
        variant === "rounded" && "rounded-lg",
        className,
      )}
      style={dimensionStyle}
      role="status"
      aria-label="Loading content"
      aria-live="polite"
    >
      <span className="sr-only">Loading</span>
      {animate && (
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-700/30 to-transparent"
          animate={{ x: ["-200%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

export function AgentNodeSkeleton() {
  return (
    <div
      className="flex flex-col items-center gap-2"
      role="status"
      aria-label="Loading agent node"
    >
      <Skeleton variant="circular" width={64} height={64} />
      <Skeleton width={60} height={12} />
      <Skeleton width={40} height={10} />
    </div>
  );
}

export function TaskCardSkeleton() {
  return (
    <div
      className="glass-panel space-y-3 rounded-lg border border-slate-800/70 bg-slate-900/70 p-4"
      role="status"
      aria-label="Loading task card"
    >
      <div className="flex items-center justify-between gap-3">
        <Skeleton width="60%" height={16} />
        <Skeleton variant="rounded" width={60} height={20} />
      </div>
      <Skeleton width="80%" height={12} />
      <Skeleton
        variant="rounded"
        width="100%"
        height={6}
        className="mt-2"
      />
      <div className="mt-2 flex items-center gap-2">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton width={80} height={12} />
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div
      className="flex items-start gap-3 px-4 py-2"
      role="status"
      aria-label="Loading message"
    >
      <Skeleton variant="circular" width={32} height={32} />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton width={80} height={12} />
          <Skeleton width={40} height={10} />
        </div>
        <Skeleton width="90%" height={14} />
        <Skeleton width="60%" height={14} />
      </div>
    </div>
  );
}

export function TopologySkeleton() {
  const positions = [
    "left-1/2 top-0 -translate-x-1/2",
    "left-0 top-1/2 -translate-y-1/2",
    "left-1/2 bottom-0 -translate-x-1/2",
    "right-0 top-1/2 -translate-y-1/2",
    "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
  ];

  return (
    <div
      className="flex h-full min-h-[300px] items-center justify-center"
      role="status"
      aria-label="Loading topology"
    >
      <div className="relative h-72 w-full max-w-md">
        {positions.map((position, index) => (
          <div key={position} className={cn("absolute", position)}>
            <AgentNodeSkeleton />
            {index < positions.length - 1 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-1/2 h-px w-24 -translate-y-1/2 bg-slate-800/60"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
