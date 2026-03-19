import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "../../lib/utils";

interface TypingIndicatorProps {
  className?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  className = "",
}) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "flex min-h-6 items-center gap-1 rounded-full px-2 py-1",
        "text-slate-400",
        className,
      )}
      aria-hidden="true"
    >
      {[0, 1, 2].map((index) => (
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.3)]"
          initial={false}
          animate={
            shouldReduceMotion
              ? {
                  opacity: 0.7,
                  scale: 1,
                  y: 0,
                }
              : {
                  y: [0, -3, 0],
                  opacity: [0.35, 1, 0.45],
                  scale: [0.92, 1.08, 0.96],
                }
          }
          transition={{
            duration: shouldReduceMotion ? 0 : 1,
            repeat: shouldReduceMotion ? 0 : Infinity,
            repeatDelay: shouldReduceMotion ? 0 : 0.1,
            delay: shouldReduceMotion ? 0 : index * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default TypingIndicator;
