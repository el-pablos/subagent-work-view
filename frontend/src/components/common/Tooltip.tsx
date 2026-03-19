import React, { useState, useRef, useEffect, ReactNode } from "react";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

interface TooltipProps {
  /** Content to display in the tooltip */
  content: ReactNode;
  /** Element(s) that trigger the tooltip on hover */
  children: ReactNode;
  /** Position of the tooltip relative to the trigger element */
  position?: TooltipPosition;
  /** Delay in milliseconds before showing the tooltip */
  delay?: number;
  /** Additional CSS class for the tooltip container */
  className?: string;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Show arrow indicator pointing to the trigger element */
  showArrow?: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = "top",
  delay = 200,
  className = "",
  disabled = false,
  showArrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showTooltip = () => {
    if (disabled) return;

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const gap = 8; // Space between trigger and tooltip

      let top = 0;
      let left = 0;

      switch (position) {
        case "top":
          top = triggerRect.top - tooltipRect.height - gap;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + gap;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case "left":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - gap;
          break;
        case "right":
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + gap;
          break;
      }

      // Prevent tooltip from going off-screen
      const padding = 8;
      if (left < padding) left = padding;
      if (left + tooltipRect.width > window.innerWidth - padding) {
        left = window.innerWidth - tooltipRect.width - padding;
      }
      if (top < padding) top = padding;
      if (top + tooltipRect.height > window.innerHeight - padding) {
        top = window.innerHeight - tooltipRect.height - padding;
      }

      setCoords({ top, left });
    }
  }, [isVisible, position]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getArrowStyles = (): React.CSSProperties => {
    const baseStyles: React.CSSProperties = {
      position: "absolute",
      width: "8px",
      height: "8px",
      backgroundColor: "#1e293b",
      transform: "rotate(45deg)",
    };

    switch (position) {
      case "top":
        return {
          ...baseStyles,
          bottom: "-4px",
          left: "50%",
          marginLeft: "-4px",
        };
      case "bottom":
        return { ...baseStyles, top: "-4px", left: "50%", marginLeft: "-4px" };
      case "left":
        return { ...baseStyles, right: "-4px", top: "50%", marginTop: "-4px" };
      case "right":
        return { ...baseStyles, left: "-4px", top: "50%", marginTop: "-4px" };
      default:
        return baseStyles;
    }
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        style={{ display: "inline-block" }}
      >
        {children}
      </div>

      {isVisible && !disabled && (
        <div
          ref={tooltipRef}
          className={`tooltip-container ${className}`}
          style={{
            position: "fixed",
            top: coords.top,
            left: coords.left,
            zIndex: 9999,
            pointerEvents: "none",
            animation: "tooltipFadeIn 0.15s ease-out",
          }}
        >
          <div
            style={{
              position: "relative",
              backgroundColor: "#1e293b",
              color: "#f8fafc",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "13px",
              lineHeight: "1.4",
              maxWidth: "250px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              border: "1px solid #334155",
            }}
          >
            {content}
            {showArrow && <div style={getArrowStyles()} />}
          </div>
        </div>
      )}

      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default Tooltip;
