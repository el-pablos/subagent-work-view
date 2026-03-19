import { type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/utils";

interface GlassPanelProps
  extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  variant?: "default" | "solid" | "subtle";
  glow?: boolean;
  className?: string;
  padding?: "none" | "sm" | "md" | "lg";
}

const variants = {
  default:
    "border border-slate-700/50 bg-slate-900/60 shadow-xl shadow-black/20 backdrop-blur-xl",
  solid:
    "border border-slate-700/30 bg-slate-900/80 shadow-lg backdrop-blur-md",
  subtle: "border border-slate-800/50 bg-slate-900/40 backdrop-blur-sm",
} as const;

const paddings = {
  none: "",
  sm: "p-3",
  md: "p-4",
  lg: "p-6",
} as const;

export function GlassPanel({
  children,
  variant = "default",
  glow = false,
  className,
  padding = "md",
  ...props
}: GlassPanelProps) {
  return (
    <motion.div
      className={cn(
        "overflow-hidden rounded-xl",
        variants[variant],
        paddings[padding],
        glow &&
          "ring-1 ring-cyan-500/10 transition-all duration-300 hover:ring-cyan-500/20",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
