import React, { useState, useCallback, useRef, useEffect } from "react";
import type { Command, CommandSuggestion } from "./types";

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
    <div className="glass-panel-solid relative">
      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div
          ref={suggestionsRef}
          className="absolute bottom-full left-0 right-0 max-h-[200px] overflow-y-auto rounded-t-md border border-b-0 border-slate-700/50 bg-slate-900/95 shadow-[0_-4px_12px_rgba(0,0,0,0.3)] backdrop-blur-xl"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={suggestion.command}
              onClick={() => handleSuggestionClick(suggestion)}
              className={`cursor-pointer border-b border-slate-800/50 px-3 py-2.5 ${
                index === selectedSuggestionIndex
                  ? "bg-slate-800/60"
                  : "hover:bg-slate-800/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <code className="font-mono text-[13px] font-medium text-cyan-400">
                  {suggestion.command}
                </code>
                <span className="text-xs text-slate-400">
                  {suggestion.description}
                </span>
              </div>
              {suggestion.usage && (
                <div className="mt-1 font-mono text-[11px] text-slate-500">
                  Usage: {suggestion.usage}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex">
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
          className={`flex-1 border-none bg-transparent px-4 py-3 font-mono text-sm outline-none placeholder:text-slate-500 ${
            disabled ? "text-slate-500" : "text-slate-100"
          }`}
        />
        <button
          type="submit"
          disabled={disabled || !input.trim()}
          className={`border-none px-5 py-3 text-sm font-medium transition-colors ${
            disabled || !input.trim()
              ? "cursor-not-allowed bg-slate-800/50 text-slate-500"
              : "cursor-pointer bg-cyan-600 text-white hover:bg-cyan-500"
          }`}
        >
          Send
        </button>
      </form>

      {/* Command history hint */}
      {history.length > 0 && (
        <div className="border-t border-slate-800/50 bg-slate-900/50 px-3 py-1 text-[11px] text-slate-500">
          Press ↑/↓ to navigate command history ({history.length} commands)
        </div>
      )}
    </div>
  );
};

export default CommandConsole;
