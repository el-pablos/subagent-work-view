import React from "react";
import { Message, MessageType } from "./types";

interface MessageBubbleProps {
  message: Message;
  className?: string;
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
 */
interface MessageColors {
  bg: string;
  border: string;
  text: string;
  accentText: string;
  subtleText: string;
  badgeBg: string;
  badgeText: string;
  channelBg: string;
  channelText: string;
}

function getMessageColors(type: MessageType): MessageColors {
  switch (type) {
    case "agent":
      return {
        bg: "bg-cyan-500/10",
        border: "border-cyan-500/20",
        text: "text-cyan-50",
        accentText: "text-cyan-200",
        subtleText: "text-cyan-300/80",
        badgeBg: "bg-cyan-500/15",
        badgeText: "text-cyan-200",
        channelBg: "bg-cyan-500/10",
        channelText: "text-cyan-100",
      };
    case "system":
      return {
        bg: "bg-purple-500/10",
        border: "border-purple-500/20",
        text: "text-purple-50",
        accentText: "text-purple-200",
        subtleText: "text-purple-300/80",
        badgeBg: "bg-purple-500/15",
        badgeText: "text-purple-200",
        channelBg: "bg-purple-500/10",
        channelText: "text-purple-100",
      };
    case "user":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
        text: "text-emerald-50",
        accentText: "text-emerald-200",
        subtleText: "text-emerald-300/80",
        badgeBg: "bg-emerald-500/15",
        badgeText: "text-emerald-200",
        channelBg: "bg-emerald-500/10",
        channelText: "text-emerald-100",
      };
    case "broadcast":
      return {
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
        text: "text-amber-50",
        accentText: "text-amber-200",
        subtleText: "text-amber-300/80",
        badgeBg: "bg-amber-500/15",
        badgeText: "text-amber-200",
        channelBg: "bg-amber-500/10",
        channelText: "text-amber-100",
      };
    default:
      return {
        bg: "bg-slate-800/50",
        border: "border-slate-700/50",
        text: "text-slate-200",
        accentText: "text-slate-300",
        subtleText: "text-slate-400",
        badgeBg: "bg-slate-700/50",
        badgeText: "text-slate-200",
        channelBg: "bg-slate-800/80",
        channelText: "text-slate-300",
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
        className={`${className} mb-1 flex justify-center rounded-lg border px-3 py-2 backdrop-blur-sm ${colors.bg} ${colors.border}`}
      >
        <div className="flex w-full items-center justify-center gap-2 text-center">
          {/* System icon */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            className={colors.accentText}
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span className={`text-[13px] italic ${colors.text}`}>{content}</span>
          <span className={`text-[11px] ${colors.subtleText}`}>
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
      className={`${className} mb-1.5 flex rounded-xl border px-3 py-2.5 text-sm backdrop-blur-sm ${colors.bg} ${colors.border}`}
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
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.35)",
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
      <div className="ml-3 min-w-0 flex-1">
        {/* Header: name, type badge, recipient, channel */}
        <div className="mb-1 flex flex-wrap items-center gap-1.5">
          <span className="text-sm font-semibold text-white">
            {sender?.name || "Unknown"}
          </span>

          {/* Agent type badge */}
          {sender?.type && (
            <span
              className={`rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium capitalize ${colors.badgeBg} ${colors.badgeText}`}
            >
              {sender.type}
            </span>
          )}

          {/* To agent indicator (if not broadcast) */}
          {recipient && type !== "broadcast" && (
            <span className={`flex items-center gap-1 text-xs ${colors.subtleText}`}>
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
              <span className={`font-medium ${colors.accentText}`}>
                {recipient.name}
              </span>
            </span>
          )}

          {/* Broadcast indicator */}
          {type === "broadcast" && (
            <span className="flex items-center gap-1 rounded-md border border-amber-400/20 bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-100 backdrop-blur-sm">
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
            className={`rounded-md border border-white/10 px-1.5 py-0.5 text-[10px] font-medium backdrop-blur-sm ${colors.channelBg} ${colors.channelText}`}
          >
            #{channel}
          </span>
        </div>

        {/* Content */}
        <div className={`whitespace-pre-wrap break-words leading-6 ${colors.text}`}>
          {content}
        </div>

        {/* Timestamp */}
        <div className={`mt-1.5 flex items-center gap-1 text-[11px] ${colors.subtleText}`}>
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
