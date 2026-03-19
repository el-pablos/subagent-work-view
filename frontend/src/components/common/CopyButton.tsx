import React, { useState } from "react";
import { useCopyToClipboard } from "../../hooks";

interface CopyButtonProps {
  text: string;
  label?: string;
  successLabel?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "ghost" | "outline";
  showTooltip?: boolean;
  className?: string;
  onCopy?: (success: boolean) => void;
}

const getSizeStyles = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return {
        padding: "4px 8px",
        fontSize: "12px",
        iconSize: "14px",
      };
    case "md":
      return {
        padding: "6px 12px",
        fontSize: "13px",
        iconSize: "16px",
      };
    case "lg":
      return {
        padding: "8px 16px",
        fontSize: "14px",
        iconSize: "18px",
      };
    default:
      return {
        padding: "6px 12px",
        fontSize: "13px",
        iconSize: "16px",
      };
  }
};

const getVariantStyles = (variant: "default" | "ghost" | "outline") => {
  switch (variant) {
    case "default":
      return {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        border: "1px solid #3b82f6",
        hover: {
          backgroundColor: "#2563eb",
          border: "1px solid #2563eb",
        },
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "#64748b",
        border: "1px solid transparent",
        hover: {
          backgroundColor: "#f1f5f9",
          border: "1px solid transparent",
        },
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        color: "#64748b",
        border: "1px solid #cbd5e1",
        hover: {
          backgroundColor: "#f1f5f9",
          border: "1px solid #94a3b8",
        },
      };
    default:
      return {
        backgroundColor: "#3b82f6",
        color: "#ffffff",
        border: "1px solid #3b82f6",
        hover: {
          backgroundColor: "#2563eb",
          border: "1px solid #2563eb",
        },
      };
  }
};

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label = "Copy",
  successLabel = "Copied!",
  size = "md",
  variant = "ghost",
  showTooltip = true,
  className = "",
  onCopy,
}) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const [showTooltipState, setShowTooltipState] = useState(false);
  const sizeStyles = getSizeStyles(size);
  const variantStyles = getVariantStyles(variant);

  const handleCopy = async () => {
    const success = await copyToClipboard(text);
    onCopy?.(success);
  };

  const handleMouseEnter = () => {
    if (showTooltip) {
      setShowTooltipState(true);
    }
  };

  const handleMouseLeave = () => {
    setShowTooltipState(false);
  };

  return (
    <div style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={handleCopy}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={className}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: sizeStyles.padding,
          fontSize: sizeStyles.fontSize,
          fontWeight: 500,
          backgroundColor: isCopied ? "#10b981" : variantStyles.backgroundColor,
          color: isCopied ? "#ffffff" : variantStyles.color,
          border: isCopied ? "1px solid #10b981" : variantStyles.border,
          borderRadius: "6px",
          cursor: "pointer",
          transition: "all 0.2s ease",
          outline: "none",
          whiteSpace: "nowrap",
        }}
        onMouseOver={(e) => {
          if (!isCopied) {
            e.currentTarget.style.backgroundColor =
              variantStyles.hover.backgroundColor;
            e.currentTarget.style.border = variantStyles.hover.border;
          }
        }}
        onMouseOut={(e) => {
          if (!isCopied) {
            e.currentTarget.style.backgroundColor =
              variantStyles.backgroundColor;
            e.currentTarget.style.border = variantStyles.border;
          }
        }}
        aria-label={isCopied ? successLabel : label}
      >
        {/* Icon */}
        <svg
          width={sizeStyles.iconSize}
          height={sizeStyles.iconSize}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            transition: "all 0.2s ease",
          }}
        >
          {isCopied ? (
            // Check icon
            <polyline points="20 6 9 17 4 12" />
          ) : (
            // Copy icon
            <>
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </>
          )}
        </svg>

        {/* Label */}
        <span>{isCopied ? successLabel : label}</span>
      </button>

      {/* Tooltip */}
      {showTooltip && showTooltipState && !isCopied && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "#1e293b",
            color: "#ffffff",
            padding: "6px 12px",
            borderRadius: "6px",
            fontSize: "12px",
            fontWeight: 500,
            whiteSpace: "nowrap",
            zIndex: 1000,
            pointerEvents: "none",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            animation: "fadeIn 0.15s ease-out",
          }}
        >
          {label}
          {/* Arrow */}
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: "50%",
              transform: "translateX(-50%)",
              width: 0,
              height: 0,
              borderLeft: "6px solid transparent",
              borderRight: "6px solid transparent",
              borderTop: "6px solid #1e293b",
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default CopyButton;
