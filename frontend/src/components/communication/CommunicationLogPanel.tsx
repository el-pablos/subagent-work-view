import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import MessageBubble from "./MessageBubble";
import MessageFilter from "./MessageFilter";
import { Message, MessageChannel, Agent } from "./types";
import {
  useSessionWebSocket,
  useWebSocketConnection,
  type MessageCreatedEvent,
} from "../../hooks/useWebSocket";

interface CommunicationLogPanelProps {
  sessionId: string;
  messages: Message[];
  agents: Agent[];
  onSendCommand?: (command: string) => void;
  onSubscribe?: (sessionId: string) => () => void;
  onMessageReceived?: (message: Message) => void;
  showFilter?: boolean;
  className?: string;
}

/**
 * CommunicationLogPanel - Agent Communications Panel
 *
 * Features:
 * - Panel header "Agent Communications"
 * - Filter by channel: All, General, Handoff, Alert
 * - Scrollable message list
 * - Auto-scroll to bottom on new messages
 * - Shows agent avatars in messages
 */
const CommunicationLogPanel: React.FC<CommunicationLogPanelProps> = ({
  sessionId,
  messages,
  agents,
  onSendCommand: _onSendCommand,
  onSubscribe,
  onMessageReceived,
  showFilter = true,
  className = "",
}) => {
  // Note: onSendCommand is available for future CommandConsole integration
  void _onSendCommand;
  const [selectedChannel, setSelectedChannel] = useState<
    MessageChannel | "all"
  >("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [typingAgents, setTypingAgents] = useState<Set<string>>(new Set());
  const [newMessageIds, setNewMessageIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // WebSocket connection state
  const connectionState = useWebSocketConnection();
  const isConnected = connectionState === "connected";

  // Handle new message from WebSocket
  const handleMessageCreated = useCallback(
    (event: MessageCreatedEvent) => {
      // Track new message for animation
      setNewMessageIds((prev) => new Set([...prev, event.message.id]));

      // Clear animation flag after animation completes
      setTimeout(() => {
        setNewMessageIds((prev) => {
          const next = new Set(prev);
          next.delete(event.message.id);
          return next;
        });
      }, 500);

      // Notify parent component
      onMessageReceived?.(event.message as unknown as Message);
    },
    [onMessageReceived]
  );

  // Subscribe to WebSocket for realtime messages
  useSessionWebSocket({
    sessionId,
    onMessageCreated: handleMessageCreated,
  });

  // Subscribe to session messages on mount
  useEffect(() => {
    if (onSubscribe) {
      const unsubscribe = onSubscribe(sessionId);
      return () => {
        unsubscribe?.();
      };
    }
  }, [sessionId, onSubscribe]);

  // Filter messages by selected channel
  const filteredMessages = useMemo(() => {
    if (selectedChannel === "all") {
      return messages;
    }
    return messages.filter((msg) => msg.channel === selectedChannel);
  }, [messages, selectedChannel]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages, autoScroll]);

  // Detect if user scrolled up (disable auto-scroll)
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  // Scroll to bottom button
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
  }, []);

  return (
    <div
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#f8fafc",
        }}
      >
        {/* Title row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: showFilter ? "12px" : "0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Chat icon */}
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                backgroundColor: "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div>
              <h3
                style={{
                  margin: 0,
                  fontSize: "16px",
                  fontWeight: 600,
                  color: "#1e293b",
                }}
              >
                Agent Communications
              </h3>
              <span
                style={{
                  fontSize: "12px",
                  color: "#64748b",
                }}
              >
                {filteredMessages.length} message
                {filteredMessages.length !== 1 ? "s" : ""}
                {selectedChannel !== "all" && ` in #${selectedChannel}`}
              </span>
            </div>
          </div>

          {/* Status indicators */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Active agents count */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: "#64748b",
                backgroundColor: "#f1f5f9",
                padding: "4px 10px",
                borderRadius: "16px",
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </span>

            {/* Connection status */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                fontSize: "12px",
                color: isConnected ? "#22c55e" : "#ef4444",
                backgroundColor: isConnected ? "#f0fdf4" : "#fef2f2",
                padding: "4px 10px",
                borderRadius: "16px",
              }}
            >
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: isConnected ? "#22c55e" : "#ef4444",
                  animation: isConnected ? "pulse 2s infinite" : "none",
                }}
              />
              {isConnected ? "Live" : "Disconnected"}
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        {showFilter && (
          <MessageFilter
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
          />
        )}
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          position: "relative",
          backgroundColor: "#fafafa",
        }}
      >
        {filteredMessages.length === 0 ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#94a3b8",
              fontSize: "14px",
              gap: "8px",
            }}
          >
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            <span>
              {messages.length === 0
                ? "No messages yet"
                : "No messages in this channel"}
            </span>
          </div>
        ) : (
          <>
            {filteredMessages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button (shown when not at bottom) */}
      {!autoScroll && (
        <button
          onClick={scrollToBottom}
          style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            backgroundColor: "#3b82f6",
            color: "white",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 10,
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </button>
      )}

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default CommunicationLogPanel;
