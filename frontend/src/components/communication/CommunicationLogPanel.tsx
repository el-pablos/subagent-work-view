import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { MessageSquare, Users, ChevronDown } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageFilter from "./MessageFilter";
import type { Message, MessageChannel, Agent } from "./types";

interface CommunicationLogPanelProps {
  sessionId: string;
  messages: Message[];
  agents: Agent[];
  onSendCommand?: (command: string) => void;
  onSubscribe?: (sessionId: string) => () => void;
  isConnected?: boolean;
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
  isConnected = true,
  showFilter = true,
  className = "",
}) => {
  // Note: onSendCommand is available for future CommandConsole integration
  void _onSendCommand;
  const [selectedChannel, setSelectedChannel] = useState<
    MessageChannel | "all"
  >("all");
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

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

  const messageCounts = useMemo(
    () =>
      messages.reduce(
        (counts, message) => {
          counts[message.channel] = (counts[message.channel] ?? 0) + 1;
          counts.all += 1;
          return counts;
        },
        {
          all: 0,
          general: 0,
          handoff: 0,
          alert: 0,
        } as Record<MessageChannel | "all", number>,
      ),
    [messages],
  );

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
    <section
      aria-labelledby="communication-title"
      className={`glass-panel noise-overlay relative flex h-full flex-col overflow-hidden rounded-xl ${className}`}
    >
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 px-3 py-2.5 backdrop-blur-xl sm:px-4 sm:py-3">
        {/* Title row */}
        <div
          className={`flex items-center justify-between ${showFilter ? "mb-2 sm:mb-3" : ""}`}
        >
          <div className="min-w-0 flex items-center gap-2 sm:gap-3">
            {/* Chat icon */}
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/15 text-cyan-100 shadow-[var(--glow-cyan)] sm:h-8 sm:w-8">
              <MessageSquare
                aria-hidden="true"
                className="h-4 w-4 sm:h-4.5 sm:w-4.5"
              />
            </div>
            <div className="min-w-0">
              <h2
                id="communication-title"
                className="truncate text-sm font-semibold text-white sm:text-base"
              >
                Agent Communications
              </h2>
              <span className="text-[10px] text-slate-400 sm:text-xs">
                {filteredMessages.length} message
                {filteredMessages.length !== 1 ? "s" : ""}
                {selectedChannel !== "all" && ` in #${selectedChannel}`}
              </span>
            </div>
          </div>

          {/* Status indicators */}
          <div className="flex flex-shrink-0 items-center gap-1.5 sm:gap-3">
            {/* Active agents count */}
            <span className="flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/60 px-1.5 py-1 text-[10px] text-slate-300 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden sm:inline">{agents.length}</span>
              <span className="sm:hidden">{agents.length}</span>
            </span>

            {/* Connection status */}
            <span
              className={`flex items-center gap-1 rounded-full border px-1.5 py-1 text-[10px] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs ${
                isConnected
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/20 bg-red-500/10 text-red-200"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full sm:h-2 sm:w-2 ${
                  isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
                }`}
              />
              <span className="hidden sm:inline">
                {isConnected ? "Live" : "Disconnected"}
              </span>
            </span>
          </div>
        </div>

        {/* Filter tabs */}
        {showFilter && (
          <MessageFilter
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
            messageCounts={messageCounts}
          />
        )}
      </div>

      {/* Messages container */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="relative flex-1 overflow-y-auto bg-slate-950/40 p-2 sm:p-3"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-xs text-slate-400 sm:text-sm">
            <MessageSquare className="h-10 w-10 stroke-1 sm:h-12 sm:w-12" />
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
          type="button"
          className="absolute bottom-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/15 text-cyan-50 shadow-[var(--glow-cyan)] transition-all hover:scale-110 hover:bg-cyan-500/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 sm:h-10 sm:w-10"
          aria-label="Scroll to latest messages"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      )}
    </section>
  );
};

export default CommunicationLogPanel;
