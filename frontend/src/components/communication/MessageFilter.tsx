import React from "react";
import { MessageChannel } from "./types";

interface MessageFilterProps {
  selectedChannel: MessageChannel | "all";
  onChannelChange: (channel: MessageChannel | "all") => void;
  className?: string;
}

const FILTER_TABS: {
  value: MessageChannel | "all";
  label: string;
  color: string;
}[] = [
  { value: "all", label: "All", color: "#64748b" },
  { value: "general", label: "General", color: "#3b82f6" },
  { value: "handoff", label: "Handoff", color: "#8b5cf6" },
  { value: "alert", label: "Alert", color: "#ef4444" },
];

/**
 * MessageFilter - Tab-based channel filter
 *
 * Features:
 * - Tab buttons for All, General, Handoff, Alert channels
 * - Active state with colored backgrounds
 * - Clean, modern design
 */
const MessageFilter: React.FC<MessageFilterProps> = ({
  selectedChannel,
  onChannelChange,
  className = "",
}) => {
  return (
    <div
      className={className}
      style={{
        display: "flex",
        gap: "4px",
        padding: "4px",
        backgroundColor: "#f1f5f9",
        borderRadius: "8px",
      }}
    >
      {FILTER_TABS.map((tab) => {
        const isActive = selectedChannel === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChannelChange(tab.value)}
            style={{
              flex: 1,
              padding: "8px 16px",
              borderRadius: "6px",
              border: "none",
              backgroundColor: isActive ? tab.color : "transparent",
              color: isActive ? "white" : "#64748b",
              fontSize: "13px",
              fontWeight: isActive ? 600 : 500,
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: isActive ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
              textTransform: "capitalize",
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "#e2e8f0";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default MessageFilter;
