import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ChevronDown, MessageSquare, Users } from "lucide-react";
import MessageBubble from "./MessageBubble";
import MessageFilter from "./MessageFilter";
import type { Agent, Message, MessageChannel } from "./types";

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
  void _onSendCommand;

  const [selectedChannel, setSelectedChannel] = useState<MessageChannel | "all">(
    "all",
  );
  const [autoScroll, setAutoScroll] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSubscribe) {
      return;
    }

    const unsubscribe = onSubscribe(sessionId);
    return () => unsubscribe?.();
  }, [sessionId, onSubscribe]);

  const filteredMessages = useMemo(() => {
    if (selectedChannel === "all") {
      return messages;
    }

    return messages.filter((message) => message.channel === selectedChannel);
  }, [messages, selectedChannel]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [filteredMessages, autoScroll]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
  }, []);

  return (
    <section
      aria-labelledby="communication-title"
      className={`glass-panel noise-overlay relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl ${className}`}
    >
      <div className="glass-panel-solid border-b border-slate-700/50 px-3 py-3 sm:px-4 sm:py-3.5">
        <div
          className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${showFilter ? "mb-3" : ""}`}
        >
          <div className="min-w-0 flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/15 text-cyan-100 shadow-[var(--glow-cyan)]">
              <MessageSquare
                aria-hidden="true"
                className="h-[18px] w-[18px]"
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
                {selectedChannel !== "all" ? ` in #${selectedChannel}` : ""}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-3">
            <span className="flex items-center gap-1 rounded-full border border-slate-700/60 bg-slate-800/60 px-2 py-1 text-[10px] text-slate-300 sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs">
              <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </span>

            <span
              className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] sm:gap-1.5 sm:px-2.5 sm:py-1 sm:text-xs ${
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
              <span>{isConnected ? "Live" : "Disconnected"}</span>
            </span>
          </div>
        </div>

        {showFilter ? (
          <MessageFilter
            selectedChannel={selectedChannel}
            onChannelChange={setSelectedChannel}
          />
        ) : null}
      </div>

      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        className="relative min-h-0 flex-1 overflow-y-auto bg-slate-950/40 p-3 sm:p-4"
      >
        {filteredMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-sm text-slate-400">
            <MessageSquare className="h-10 w-10 stroke-1 sm:h-12 sm:w-12" />
            <span>
              {messages.length === 0
                ? "No messages yet"
                : "No messages in this channel"}
            </span>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {!autoScroll ? (
        <button
          onClick={scrollToBottom}
          type="button"
          className="absolute bottom-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/15 text-cyan-50 shadow-[var(--glow-cyan)] transition-all hover:scale-110 hover:bg-cyan-500/25 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          aria-label="Scroll to latest messages"
        >
          <ChevronDown className="h-5 w-5" />
        </button>
      ) : null}
    </section>
  );
};

export default CommunicationLogPanel;
