import React, { useState, useCallback, useRef, useEffect } from "react";

export interface QuickAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

export interface HeaderCommandBarProps {
  onSearch?: (query: string) => void;
  quickActions?: QuickAction[];
  placeholder?: string;
}

const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "pause-all",
    label: "Pause All",
    shortcut: "⌘P",
    action: () => console.log("Pause all agents"),
  },
  {
    id: "resume-all",
    label: "Resume All",
    shortcut: "⌘R",
    action: () => console.log("Resume all agents"),
  },
  {
    id: "stop-session",
    label: "Stop Session",
    shortcut: "⌘S",
    action: () => console.log("Stop session"),
  },
];

const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  onSearch,
  quickActions = DEFAULT_QUICK_ACTIONS,
  placeholder = "Search agents, tasks, or enter command...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut to focus search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  const handleSearchSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (searchQuery.trim()) {
        onSearch?.(searchQuery.trim());
      }
    },
    [searchQuery, onSearch],
  );

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2">
      <div className="flex items-center justify-between space-x-4">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          className={`flex-1 max-w-xl relative transition-all duration-200 ${
            isFocused ? "scale-[1.01]" : ""
          }`}
        >
          <div
            className={`flex items-center bg-slate-800 rounded-lg border transition-colors ${
              isFocused
                ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                : "border-slate-700"
            }`}
          >
            {/* Search Icon */}
            <div className="pl-3 text-slate-500">
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
            />

            {/* Keyboard Shortcut Hint */}
            <div className="pr-3 flex items-center space-x-1">
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-700/50 rounded border border-slate-600">
                ⌘
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-slate-500 bg-slate-700/50 rounded border border-slate-600">
                K
              </kbd>
            </div>
          </div>
        </form>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-400 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700 transition-colors"
              title={
                action.shortcut
                  ? `${action.label} (${action.shortcut})`
                  : action.label
              }
            >
              {action.icon && <span>{action.icon}</span>}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeaderCommandBar;
