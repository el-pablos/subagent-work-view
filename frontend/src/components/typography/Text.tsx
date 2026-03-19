import { type ReactNode } from "react";

type TextVariant = "body" | "body-lg" | "body-sm" | "caption" | "muted";

interface TextProps {
  variant?: TextVariant;
  children: ReactNode;
  className?: string;
  as?: "p" | "span" | "div";
}

const textStyles: Record<TextVariant, string> = {
  body: "text-base text-slate-300 leading-relaxed",
  "body-lg": "text-lg text-slate-300 leading-relaxed",
  "body-sm": "text-sm text-slate-300 leading-normal",
  caption: "text-xs text-slate-400 leading-normal",
  muted: "text-sm text-slate-500 leading-normal",
};

export function Text({
  variant = "body",
  children,
  className = "",
  as: Tag = "p",
}: TextProps) {
  const baseStyles = textStyles[variant];

  return <Tag className={`${baseStyles} ${className}`}>{children}</Tag>;
}
