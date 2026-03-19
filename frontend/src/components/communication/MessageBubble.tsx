import React from "react";
import { Message, MessageType } from "./types";

interface MessageBubbleProps {
  message: Message;
  className?: string;
  isNew?: boolean;
}

/**
 * Get initials from agent name for avatar
 */
function getInitials(name: string): string {
  return name
    .split(/[\s-_]+/)
    .map((word) => word[0]?.toUpperCase() || "")
    .slice(0, 2)
    .join("");
}

/**
 * Get avatar color based on agent type
 */
function getAvatarColor(type: string): string {
  const colors: Record<string, string> = {
    leader: "#6366f1", // indigo
    worker: "#22c55e", // green
    reviewer: "#f59e0b", // amber
    planner: "#8b5cf6", // violet
    executor: "#3b82f6", // blue
    user: "#10b981", // emerald
  };
  return colors[type.toLowerCase()] || "#64748b"; // slate default
}

/**
 * Format timestamp to readable time
 */
function formatTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

/**
 * Message type color configurations
 * - agent: slate
 * - system: sky
 * - user: emerald
 * - broadcast: amber
 */
interface MessageColors {
  bg: string;
  border: string;
  text: string;
  accent: string;
}

function getMessageColors(type: MessageType): MessageColors {
  switch (type) {
    case "agent":
      return {
        bg: "#f8fafc", // slate-50
        border: "#e2e8f0", // slate-200
        text: "#334155", // slate-700
        accent: "#64748b", // slate-500
      };
    case "system":
      return {
        bg: "#f0f9ff", // sky-50
        border: "#bae6fd", // sky-200
        text: "#0369a1", // sky-700
        accent: "#0ea5e9", // sky-500
      };
    case "user":
      return {
        bg: "#ecfdf5", // emerald-50
        border: "#a7f3d0", // emerald-200
        text: "#047857", // emerald-700
        accent: "#10b981", // emerald-500
      };
    case "broadcast":
      return {
        bg: "#fffbeb", // amber-50
        border: "#fcd34d", // amber-300
        text: "#b45309", // amber-700
        accent: "#f59e0b", // amber-500
      };
    default:
      return {
        bg: "#f8fafc",
        border: "#e2e8f0",
        text: "#334155",
        accent: "#64748b",
      };
  }
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  className = "",
}) => {
  const { type, content, timestamp, sender, recipient, channel } = message;
  const colors = getMessageColors(type);

  // System messages render centered without avatar
  if (type === "system") {
    return (
      <div
        className={className}
        style={{
          display: "flex",
          justifyContent: "center",
          padding: "8px 12px",
          marginBottom: "4px",
          borderRadius: "8px",
          backgroundColor: colors.bg,
          border: `1px solid ${colors.border}`,
        }}
      >
        <div
          style={{
            textAlign: "center",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
        >
          {/* System icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.accent}
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span
            style={{
              color: colors.text,
              fontSize: "13px",
              fontStyle: "italic",
            }}
          >
            {content}
          </span>
          <span style={{ fontSize: "11px", color: colors.accent }}>
            {formatTime(timestamp)}
          </span>
        </div>
      </div>
    );
  }

  const avatarColor = sender ? getAvatarColor(sender.type) : "#64748b";
  const initials = sender ? getInitials(sender.name) : "?";

  return (
    <div
      className={className}
      style={{
        display: "flex",
        padding: "10px 12px",
        marginBottom: "6px",
        borderRadius: "10px",
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        fontSize: "14px",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: "38px",
          height: "38px",
          borderRadius: "50%",
          backgroundColor: avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: 600,
          fontSize: "13px",
          flexShrink: 0,
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {sender?.avatar ? (
          <img
            src={sender.avatar}
            alt={sender.name}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          initials
        )}
      </div>

      {/* Message content */}
      <div style={{ marginLeft: "12px", flex: 1, minWidth: 0 }}>
        {/* Header: name, type badge, recipient, channel */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "6px",
            marginBottom: "4px",
          }}
        >
          <span style={{ fontWeight: 600, color: "#1e293b", fontSize: "14px" }}>
            {sender?.name || "Unknown"}
          </span>

          {/* Agent type badge */}
          {sender?.type && (
            <span
              style={{
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                backgroundColor: avatarColor + "20",
                color: avatarColor,
                textTransform: "capitalize",
                fontWeight: 500,
              }}
            >
              {sender.type}
            </span>
          )}

          {/* To agent indicator (if not broadcast) */}
          {recipient && type !== "broadcast" && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "12px",
                color: "#64748b",
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              <span style={{ fontWeight: 500, color: "#475569" }}>
                {recipient.name}
              </span>
            </span>
          )}

          {/* Broadcast indicator */}
          {type === "broadcast" && (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "10px",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "#fef3c7",
                color: "#d97706",
                fontWeight: 600,
              }}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
              BROADCAST
            </span>
          )}

          {/* Channel badge */}
          <span
            style={{
              fontSize: "10px",
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "#e2e8f0",
              color: "#64748b",
              fontWeight: 500,
            }}
          >
            #{channel}
          </span>
        </div>

        {/* Content */}
        <div
          style={{
            color: colors.text,
            wordBreak: "break-word",
            whiteSpace: "pre-wrap",
            lineHeight: "1.5",
          }}
        >
          {content}
        </div>

        {/* Timestamp */}
        <div
          style={{
            fontSize: "11px",
            color: "#94a3b8",
            marginTop: "6px",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {formatTime(timestamp)}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
