import React, { useState, useCallback, useRef, useEffect } from "react";
import CommandHistory from "./CommandHistory";
import { CommandEntry, CommandSuggestion } from "./types";

interface CommandConsoleProps {
  onSubmit: (
    command: string,
  ) => Promise<{ sessionId?: string; error?: string }>;
  suggestions?: CommandSuggestion[];
  disabled?: boolean;
  placeholder?: string;
  maxHistory?: number;
}

const DEFAULT_SUGGESTIONS: CommandSuggestion[] = [
  { command: "/help", description: "Show available commands" },
  { command: "/status", description: "Show current session status" },
  { command: "/agents", description: "List all active agents" },
  { command: "/tasks", description: "List all tasks" },
  {
    command: "/broadcast",
    description: "Send message to all agents",
    usage: "/broadcast <message>",
  },
  { command: "/stop", description: "Stop current session" },
  { command: "/pause", description: "Pause agent execution" },
  { command: "/resume", description: "Resume agent execution" },
  {
    command: "/new",
    description: "Create new session",
    usage: "/new <task description>",
  },
];

const CommandConsole: React.FC<CommandConsoleProps> = ({
  onSubmit,
  suggestions = DEFAULT_SUGGESTIONS,
  disabled = false,
  placeholder = "Enter command or task description...",
  maxHistory = 50,
}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandEntry[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    CommandSuggestion[]
  >([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const historyRef = useRef<HTMLDivElement>(null);

  // Filter suggestions based on input
  useEffect(() => {
    if (input.startsWith("/")) {
      const filtered = suggestions.filter((s) =>
        s.command.toLowerCase().startsWith(input.toLowerCase()),
      );
      setFilteredSuggestions(filtered);
      setShowSuggestions(filtered.length > 0 && input !== filtered[0]?.command);
      setSelectedSuggestionIndex(0);
    } else {
      setShowSuggestions(false);
      setFilteredSuggestions([]);
    }
  }, [input, suggestions]);

  // Scroll history to bottom on new entry
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [history]);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedInput = input.trim();

      if (!trimmedInput || disabled || isSubmitting) return;

      // Create new command entry
      const newCommand: CommandEntry = {
        id: Date.now().toString(),
        command: trimmedInput,
        timestamp: new Date().toISOString(),
        status: "running",
      };

      setHistory((prev) => {
        const updated = [...prev, newCommand];
        return updated.slice(-maxHistory);
      });

      setInput("");
      setHistoryIndex(-1);
      setShowSuggestions(false);
      setIsSubmitting(true);

      try {
        const result = await onSubmit(trimmedInput);

        // Update command status
        setHistory((prev) =>
          prev.map((cmd) =>
            cmd.id === newCommand.id
              ? {
                  ...cmd,
                  status: result.error ? "error" : "success",
                  sessionId: result.sessionId,
                  output: result.error,
                }
              : cmd,
          ),
        );
      } catch (error) {
        setHistory((prev) =>
          prev.map((cmd) =>
            cmd.id === newCommand.id
              ? {
                  ...cmd,
                  status: "error",
                  output:
                    error instanceof Error ? error.message : "Unknown error",
                }
              : cmd,
          ),
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [input, disabled, isSubmitting, onSubmit, maxHistory],
  );

  // Handle command rerun
  const handleRerun = useCallback((command: string) => {
    setInput(command);
    inputRef.current?.focus();
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Arrow up: navigate history or suggestions
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (showSuggestions && filteredSuggestions.length > 0) {
          setSelectedSuggestionIndex((prev) =>
            prev > 0 ? prev - 1 : filteredSuggestions.length - 1,
          );
        } else if (history.length > 0) {
          const commandHistory = history.map((h) => h.command);
          const newIndex =
            historyIndex < commandHistory.length - 1
              ? historyIndex + 1
              : historyIndex;
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
        }
      }

      // Arrow down: navigate history or suggestions
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (showSuggestions && filteredSuggestions.length > 0) {
          setSelectedSuggestionIndex((prev) =>
            prev < filteredSuggestions.length - 1 ? prev + 1 : 0,
          );
        } else if (historyIndex > 0) {
          const commandHistory = history.map((h) => h.command);
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(commandHistory[commandHistory.length - 1 - newIndex] || "");
        } else if (historyIndex === 0) {
          setHistoryIndex(-1);
          setInput("");
        }
      }

      // Tab: autocomplete suggestion
      if (
        e.key === "Tab" &&
        showSuggestions &&
        filteredSuggestions.length > 0
      ) {
        e.preventDefault();
        const suggestion = filteredSuggestions[selectedSuggestionIndex];
        if (suggestion) {
          setInput(suggestion.command + " ");
          setShowSuggestions(false);
        }
      }

      // Enter: submit or select suggestion
      if (e.key === "Enter") {
        if (showSuggestions && filteredSuggestions.length > 0) {
          e.preventDefault();
          const suggestion = filteredSuggestions[selectedSuggestionIndex];
          if (suggestion) {
            setInput(suggestion.command + " ");
            setShowSuggestions(false);
          }
        }
      }

      // Escape: close suggestions
      if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    },
    [
      showSuggestions,
      filteredSuggestions,
      selectedSuggestionIndex,
      history,
      historyIndex,
    ],
  );

  // Select suggestion on click
  const handleSuggestionClick = useCallback((suggestion: CommandSuggestion) => {
    setInput(suggestion.command + " ");
    setShowSuggestions(false);
    inputRef.current?.focus();
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#0f172a",
        borderRadius: "8px",
        overflow: "hidden",
        fontFamily:
          '"JetBrains Mono", "Fira Code", "SF Mono", Consolas, monospace',
      }}
    >
      {/* Terminal header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "12px 16px",
          backgroundColor: "#1e293b",
          borderBottom: "1px solid #334155",
        }}
      >
        <div style={{ display: "flex", gap: "8px", marginRight: "16px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#ef4444",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#eab308",
            }}
          />
          <div
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
            }}
          />
        </div>
        <span style={{ color: "#94a3b8", fontSize: "13px", fontWeight: 500 }}>
          Command Console
        </span>
        {isSubmitting && (
          <span
            style={{
              marginLeft: "auto",
              color: "#22c55e",
              fontSize: "12px",
              animation: "pulse 1.5s infinite",
            }}
          >
            Processing...
          </span>
        )}
      </div>

      {/* Command history */}
      <div
        ref={historyRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          backgroundColor: "#0f172a",
        }}
      >
        {history.length === 0 ? (
          <div
            style={{
              color: "#475569",
              fontSize: "13px",
              textAlign: "center",
              padding: "40px 20px",
            }}
          >
            <div style={{ marginBottom: "8px" }}>
              Welcome to the Command Console
            </div>
            <div style={{ fontSize: "12px" }}>
              Type a command or task description to get started. Use{" "}
              <code
                style={{
                  color: "#3b82f6",
                  backgroundColor: "#1e293b",
                  padding: "2px 6px",
                  borderRadius: "4px",
                }}
              >
                /help
              </code>{" "}
              for available commands.
            </div>
          </div>
        ) : (
          <CommandHistory entries={history} onRerun={handleRerun} />
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          style={{
            backgroundColor: "#1e293b",
            borderTop: "1px solid #334155",
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.command}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "10px 16px",
                cursor: "pointer",
                backgroundColor:
                  index === selectedSuggestionIndex ? "#334155" : "transparent",
                borderBottom: "1px solid #334155",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <code
                  style={{
                    fontSize: "13px",
                    color: "#3b82f6",
                    fontWeight: 500,
                  }}
                >
                  {suggestion.command}
                </code>
                <span style={{ fontSize: "12px", color: "#64748b" }}>
                  {suggestion.description}
                </span>
              </div>
              {suggestion.usage && (
                <div
                  style={{
                    fontSize: "11px",
                    color: "#475569",
                    marginTop: "4px",
                  }}
                >
                  Usage: {suggestion.usage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          borderTop: "1px solid #334155",
          backgroundColor: "#1e293b",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 12px",
            color: "#22c55e",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          {">"}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (input.startsWith("/") && filteredSuggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          disabled={disabled || isSubmitting}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "14px 0",
            border: "none",
            fontSize: "14px",
            fontFamily: "inherit",
            outline: "none",
            backgroundColor: "transparent",
            color: disabled ? "#475569" : "#e2e8f0",
          }}
        />
        <button
          type="submit"
          disabled={disabled || isSubmitting || !input.trim()}
          style={{
            padding: "14px 20px",
            border: "none",
            backgroundColor:
              disabled || isSubmitting || !input.trim() ? "#334155" : "#3b82f6",
            color:
              disabled || isSubmitting || !input.trim() ? "#64748b" : "#ffffff",
            fontWeight: 600,
            fontSize: "13px",
            fontFamily: "inherit",
            cursor:
              disabled || isSubmitting || !input.trim()
                ? "not-allowed"
                : "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          {isSubmitting ? "Sending..." : "Execute"}
        </button>
      </form>

      {/* Keyboard hints */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          padding: "8px 16px",
          fontSize: "11px",
          color: "#475569",
          backgroundColor: "#0f172a",
          borderTop: "1px solid #1e293b",
        }}
      >
        <span>
          <kbd
            style={{
              backgroundColor: "#1e293b",
              padding: "2px 6px",
              borderRadius: "3px",
              marginRight: "4px",
            }}
          >
            Tab
          </kbd>
          Autocomplete
        </span>
        <span>
          <kbd
            style={{
              backgroundColor: "#1e293b",
              padding: "2px 6px",
              borderRadius: "3px",
              marginRight: "4px",
            }}
          >
            Up/Down
          </kbd>
          History
        </span>
        <span>
          <kbd
            style={{
              backgroundColor: "#1e293b",
              padding: "2px 6px",
              borderRadius: "3px",
              marginRight: "4px",
            }}
          >
            Enter
          </kbd>
          Execute
        </span>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default CommandConsole;
