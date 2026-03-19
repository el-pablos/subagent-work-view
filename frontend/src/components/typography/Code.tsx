import { type ReactNode } from "react";

type CodeVariant = "inline" | "block";

interface CodeProps {
  variant?: CodeVariant;
  children: ReactNode;
  className?: string;
}

export function Code({
  variant = "inline",
  children,
  className = "",
}: CodeProps) {
  if (variant === "inline") {
    return (
      <code
        className={`font-mono text-sm bg-slate-800 text-emerald-400 px-1.5 py-0.5 rounded ${className}`}
      >
        {children}
      </code>
    );
  }

  return (
    <pre
      className={`font-mono text-sm bg-slate-900 text-slate-300 p-4 rounded-lg overflow-x-auto border border-slate-700 ${className}`}
    >
      <code>{children}</code>
    </pre>
  );
}
