import React, { useState, useCallback, useRef, useEffect } from "react";
import { Command, CommandSuggestion } from "./types";

interface CommandConsoleProps {
  onSubmit: (command: string) => void;
  suggestions?: CommandSuggestion[];
  disabled?: boolean;
  placeholder?: string;
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
];

const MAX_HISTORY = 50;

const CommandConsole: React.FC<CommandConsoleProps> = ({
  onSubmit,
  suggestions = DEFAULT_SUGGESTIONS,
  disabled = false,
  placeholder = "Enter command (e.g., /help)...",
}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<Command[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<
    CommandSuggestion[]
  >([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

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

  // Handle form submission
  const handleSubmit = useCallback(
    (e?: React.FormEvent) => {
      e?.preventDefault();
      const trimmedInput = input.trim();

      if (!trimmedInput || disabled) return;

      // Add to history
      const newCommand: Command = {
        id: Date.now().toString(),
        text: trimmedInput,
        timestamp: new Date().toISOString(),
      };

      setHistory((prev) => {
        const updated = [newCommand, ...prev];
        return updated.slice(0, MAX_HISTORY);
      });

      // Submit command
      onSubmit(trimmedInput);

      // Reset state
      setInput("");
      setHistoryIndex(-1);
      setShowSuggestions(false);
    },
    [input, disabled, onSubmit],
  );

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
          const newIndex =
            historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
          setHistoryIndex(newIndex);
          setInput(history[newIndex]?.text || "");
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
          const newIndex = historyIndex - 1;
          setHistoryIndex(newIndex);
          setInput(history[newIndex]?.text || "");
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
        // Let form handle submit if no suggestions
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
        position: "relative",
        borderTop: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
      }}
    >
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          style={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            backgroundColor: "#ffffff",
            border: "1px solid #e2e8f0",
            borderBottom: "none",
            borderRadius: "6px 6px 0 0",
            maxHeight: "200px",
            overflowY: "auto",
            boxShadow: "0 -4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.command}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{
                padding: "10px 12px",
                cursor: "pointer",
                backgroundColor:
                  index === selectedSuggestionIndex ? "#f1f5f9" : "transparent",
                borderBottom: "1px solid #f1f5f9",
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
                    fontFamily: "monospace",
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
                    color: "#94a3b8",
                    marginTop: "4px",
                    fontFamily: "monospace",
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
      <form onSubmit={handleSubmit} style={{ display: "flex" }}>
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
            // Delay hiding to allow click on suggestions
            setTimeout(() => setShowSuggestions(false), 150);
          }}
          disabled={disabled}
          placeholder={placeholder}
          style={{
            flex: 1,
            padding: "12px 16px",
            border: "none",
            fontSize: "14px",
            fontFamily: "monospace",
            outline: "none",
            backgroundColor: disabled ? "#f8fafc" : "#ffffff",
            color: disabled ? "#94a3b8" : "#1e293b",
          }}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          style={{
            padding: "12px 20px",
            border: "none",
            backgroundColor: disabled || !input.trim() ? "#e2e8f0" : "#3b82f6",
            color: disabled || !input.trim() ? "#94a3b8" : "#ffffff",
            fontWeight: 500,
            fontSize: "14px",
            cursor: disabled || !input.trim() ? "not-allowed" : "pointer",
            transition: "background-color 0.15s ease",
          }}
        >
          Send
        </button>
      </form>

      {/* Command history hint */}
      {history.length > 0 && (
        <div
          style={{
            padding: "4px 12px",
            fontSize: "11px",
            color: "#94a3b8",
            backgroundColor: "#f8fafc",
            borderTop: "1px solid #f1f5f9",
          }}
        >
          Press ↑/↓ to navigate command history ({history.length} commands)
        </div>
      )}
    </div>
  );
};

export default CommandConsole;
