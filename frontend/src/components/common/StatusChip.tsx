import React from "react";

export type StatusType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "pending"
  | "running"
  | "completed"
  | "failed";

interface StatusChipProps {
  status: StatusType;
  label?: string;
  size?: "sm" | "md" | "lg";
  icon?: boolean;
}

const getStatusStyles = (
  status: StatusType,
): { bg: string; color: string; border: string } => {
  switch (status) {
    case "success":
    case "completed":
      return { bg: "#dcfce7", color: "#15803d", border: "#86efac" };
    case "error":
    case "failed":
      return { bg: "#fee2e2", color: "#991b1b", border: "#fca5a5" };
    case "warning":
      return { bg: "#fef3c7", color: "#92400e", border: "#fcd34d" };
    case "info":
      return { bg: "#dbeafe", color: "#1e40af", border: "#93c5fd" };
    case "pending":
      return { bg: "#f1f5f9", color: "#475569", border: "#cbd5e1" };
    case "running":
      return { bg: "#e0e7ff", color: "#3730a3", border: "#a5b4fc" };
    default:
      return { bg: "#f1f5f9", color: "#64748b", border: "#cbd5e1" };
  }
};

const getStatusIcon = (status: StatusType): string | null => {
  switch (status) {
    case "success":
    case "completed":
      return "✓";
    case "error":
    case "failed":
      return "✗";
    case "warning":
      return "⚠";
    case "info":
      return "ℹ";
    case "pending":
      return "○";
    case "running":
      return "◐";
    default:
      return null;
  }
};

const getSizeStyles = (size: "sm" | "md" | "lg") => {
  switch (size) {
    case "sm":
      return { padding: "2px 8px", fontSize: "11px", iconSize: "10px" };
    case "md":
      return { padding: "4px 10px", fontSize: "12px", iconSize: "11px" };
    case "lg":
      return { padding: "6px 14px", fontSize: "13px", iconSize: "12px" };
    default:
      return { padding: "4px 10px", fontSize: "12px", iconSize: "11px" };
  }
};

const StatusChip: React.FC<StatusChipProps> = ({
  status,
  label,
  size = "md",
  icon = true,
}) => {
  const styles = getStatusStyles(status);
  const sizeStyles = getSizeStyles(size);
  const statusIcon = icon ? getStatusIcon(status) : null;
  const displayLabel =
    label || status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: sizeStyles.padding,
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
        borderRadius: "12px",
        fontSize: sizeStyles.fontSize,
        fontWeight: 500,
        whiteSpace: "nowrap",
      }}
    >
      {statusIcon && (
        <span
          style={{
            fontSize: sizeStyles.iconSize,
            animation:
              status === "running" ? "spin 1s linear infinite" : "none",
          }}
        >
          {statusIcon}
        </span>
      )}
      {displayLabel}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </span>
  );
};

export default StatusChip;
