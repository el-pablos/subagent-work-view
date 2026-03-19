import React from "react";
import type { CommandEntry, CommandStatus } from "./types";

interface CommandHistoryProps {
  entries: CommandEntry[];
  onRerun: (command: string) => void;
}

const getStatusColor = (status: CommandStatus): string => {
  switch (status) {
    case "pending":
      return "#94a3b8";
    case "running":
      return "#eab308";
    case "success":
      return "#22c55e";
    case "error":
      return "#ef4444";
    default:
      return "#94a3b8";
  }
};

const getStatusIcon = (status: CommandStatus): string => {
  switch (status) {
    case "pending":
      return "○";
    case "running":
      return "◐";
    case "success":
      return "✓";
    case "error":
      return "✗";
    default:
      return "○";
  }
};

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const formatRelativeTime = (timestamp: string): string => {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return formatTimestamp(timestamp);
};

const CommandHistory: React.FC<CommandHistoryProps> = ({
  entries,
  onRerun,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {entries.map((entry) => (
        <div
          key={entry.id}
          style={{
            padding: "12px 14px",
            backgroundColor: "#1e293b",
            borderRadius: "6px",
            borderLeft: `3px solid ${getStatusColor(entry.status)}`,
          }}
        >
          {/* Command header */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                flex: 1,
              }}
            >
              {/* Status icon */}
              <span
                style={{
                  color: getStatusColor(entry.status),
                  fontSize: "14px",
                  lineHeight: "20px",
                  animation:
                    entry.status === "running"
                      ? "spin 1s linear infinite"
                      : "none",
                }}
              >
                {getStatusIcon(entry.status)}
              </span>

              {/* Command text */}
              <div style={{ flex: 1 }}>
                <code
                  style={{
                    fontSize: "13px",
                    color: "#e2e8f0",
                    wordBreak: "break-word",
                  }}
                >
                  {entry.command}
                </code>

                {/* Output/Error message */}
                {entry.output && (
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 10px",
                      backgroundColor:
                        entry.status === "error" ? "#450a0a" : "#0f172a",
                      borderRadius: "4px",
                      fontSize: "12px",
                      color: entry.status === "error" ? "#fca5a5" : "#94a3b8",
                    }}
                  >
                    {entry.output}
                  </div>
                )}

                {/* Session ID badge */}
                {entry.sessionId && (
                  <div style={{ marginTop: "8px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        backgroundColor: "#1e3a5f",
                        borderRadius: "4px",
                        fontSize: "11px",
                        color: "#60a5fa",
                      }}
                    >
                      Session: {entry.sessionId}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions and timestamp */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "6px",
                flexShrink: 0,
              }}
            >
              {/* Timestamp */}
              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b",
                }}
                title={new Date(entry.timestamp).toLocaleString()}
              >
                {formatRelativeTime(entry.timestamp)}
              </span>

              {/* Rerun button */}
              <button
                onClick={() => onRerun(entry.command)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 8px",
                  backgroundColor: "transparent",
                  border: "1px solid #334155",
                  borderRadius: "4px",
                  fontSize: "11px",
                  color: "#94a3b8",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#334155";
                  e.currentTarget.style.color = "#e2e8f0";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#94a3b8";
                }}
              >
                <span style={{ fontSize: "10px" }}>&#8634;</span>
                Rerun
              </button>
            </div>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CommandHistory;
