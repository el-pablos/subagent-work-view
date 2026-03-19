import { type ReactNode } from "react";

type LabelVariant = "default" | "required" | "optional";

interface LabelProps {
  variant?: LabelVariant;
  children: ReactNode;
  htmlFor?: string;
  className?: string;
}

export function Label({
  variant = "default",
  children,
  htmlFor,
  className = "",
}: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={`text-sm font-medium text-slate-300 ${className}`}
    >
      {children}
      {variant === "required" && (
        <span className="text-rose-500 ml-0.5">*</span>
      )}
      {variant === "optional" && (
        <span className="text-slate-500 ml-1 text-xs font-normal">
          (optional)
        </span>
      )}
    </label>
  );
}
