import { type ReactNode } from "react";

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

interface HeadingProps {
  level?: HeadingLevel;
  children: ReactNode;
  className?: string;
}

const headingStyles: Record<HeadingLevel, string> = {
  h1: "text-5xl font-bold tracking-tight text-slate-100",
  h2: "text-4xl font-bold tracking-tight text-slate-100",
  h3: "text-3xl font-semibold tracking-tight text-slate-100",
  h4: "text-2xl font-semibold text-slate-200",
  h5: "text-xl font-medium text-slate-200",
  h6: "text-lg font-medium text-slate-300",
};

export function Heading({
  level = "h1",
  children,
  className = "",
}: HeadingProps) {
  const Tag = level;
  const baseStyles = headingStyles[level];

  return <Tag className={`${baseStyles} ${className}`}>{children}</Tag>;
}
