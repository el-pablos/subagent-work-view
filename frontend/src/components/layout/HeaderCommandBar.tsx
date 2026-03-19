import React, { useState, useCallback, useRef, useEffect } from "react";
import { Search, Command } from "lucide-react";

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
    <nav
      aria-label="Command bar"
      className="bg-slate-900/80 border-b border-slate-800 px-3 py-2 sm:px-4"
    >
      <div className="flex items-center justify-between space-x-2 sm:space-x-4">
        {/* Search Bar */}
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className={`flex-1 max-w-full sm:max-w-xl relative transition-all duration-200 ${
            isFocused ? "scale-[1.01]" : ""
          }`}
        >
          <label htmlFor="header-command-search" className="sr-only">
            Search agents, tasks, or commands
          </label>
          <div
            className={`flex items-center bg-slate-800 rounded-lg border transition-colors ${
              isFocused
                ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                : "border-slate-700"
            }`}
          >
            {/* Search Icon */}
            <div className="pl-2.5 sm:pl-3 text-slate-500">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            <input
              id="header-command-search"
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={placeholder}
              className="flex-1 bg-transparent border-none px-2 sm:px-3 py-1.5 sm:py-2 text-fluid-sm sm:text-fluid-base font-medium tracking-tight text-white placeholder:text-slate-500 focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
            />

            {/* Keyboard Shortcut Hint - Hidden on mobile */}
            <div className="pr-2 sm:pr-3 hidden sm:flex items-center space-x-1">
              <kbd className="flex items-center rounded border border-slate-600 bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-slate-500">
                <Command className="w-2.5 h-2.5" />
              </kbd>
              <kbd className="rounded border border-slate-600 bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-slate-500">
                K
              </kbd>
            </div>
          </div>
        </form>

        {/* Quick Actions - Hidden on mobile, visible on md+ */}
        <div className="hidden md:flex items-center space-x-2">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              type="button"
              aria-label={action.label}
              className="flex items-center space-x-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-fluid-xs font-medium tracking-tight text-slate-400 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
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
    </nav>
  );
};

export default HeaderCommandBar;
