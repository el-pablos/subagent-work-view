import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { ArrowDown, MessagesSquare } from "lucide-react";
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

  const [selectedChannel, setSelectedChannel] = useState<
    MessageChannel | "all"
  >("all");
  const [autoScroll, setAutoScroll] = useState(true);
  const [showTopFade, setShowTopFade] = useState(false);
  const [showBottomFade, setShowBottomFade] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onSubscribe) {
      return;
    }

    const unsubscribe = onSubscribe(sessionId);
    return () => unsubscribe?.();
  }, [sessionId, onSubscribe]);

  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const hasOverflow = scrollHeight > clientHeight;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;

    setAutoScroll(isAtBottom);
    setShowTopFade(hasOverflow && scrollTop > 10);
    setShowBottomFade(
      hasOverflow &&
        !isAtBottom &&
        scrollHeight - scrollTop - clientHeight > 10,
    );
  }, []);

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
    handleScroll();
  }, [filteredMessages, autoScroll, handleScroll]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    setAutoScroll(true);
  }, []);

  return (
    <section
      aria-labelledby="communication-title"
      className={`glass-panel noise-overlay relative flex h-full min-h-0 flex-col overflow-hidden rounded-xl ${className}`}
    >
      <div className="glass-panel-solid border-b border-slate-700/50 px-2 py-1.5 sm:px-3 sm:py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <h2
              id="communication-title"
              className="truncate text-xs font-medium text-white sm:text-sm"
            >
              Communications
            </h2>
            <span className="text-[10px] text-slate-400">
              {filteredMessages.length}
              {selectedChannel !== "all" ? ` · #${selectedChannel}` : ""}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] text-slate-400 sm:text-xs">
              {agents.length} agent{agents.length !== 1 ? "s" : ""}
            </span>

            <span
              className={`h-1.5 w-1.5 rounded-full ${
                isConnected ? "bg-emerald-400 animate-pulse" : "bg-red-400"
              }`}
              title={isConnected ? "Connected" : "Disconnected"}
            />
          </div>
        </div>

        {showFilter ? (
          <div className="mt-1.5">
            <MessageFilter
              selectedChannel={selectedChannel}
              onChannelChange={setSelectedChannel}
            />
          </div>
        ) : null}
      </div>

      <div className="relative min-h-0 flex-1">
        {/* Top fade indicator */}
        {showTopFade && (
          <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 h-8 bg-gradient-to-b from-slate-950/80 to-transparent" />
        )}

        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          role="log"
          aria-live="polite"
          aria-relevant="additions text"
          className="h-full overflow-y-auto bg-slate-950/40 p-2 sm:p-2"
        >
          {filteredMessages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-1.5 text-center text-xs text-slate-400">
              <MessagesSquare className="h-8 w-8 stroke-1 sm:h-9 sm:w-9" />
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

        {/* Bottom fade indicator */}
        {showBottomFade && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 h-8 bg-gradient-to-t from-slate-950/80 to-transparent" />
        )}
      </div>

      {!autoScroll ? (
        <button
          onClick={scrollToBottom}
          type="button"
          className="absolute bottom-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full border border-slate-600/40 bg-slate-800/80 text-slate-300 transition-all hover:scale-105 hover:bg-slate-700/80 hover:text-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="h-4 w-4" />
        </button>
      ) : null}
    </section>
  );
};

export default CommunicationLogPanel;
