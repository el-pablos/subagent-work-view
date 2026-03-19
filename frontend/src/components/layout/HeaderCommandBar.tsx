import React, { useCallback, useEffect, useRef, useState } from "react";
import { Command, MoreHorizontal, Search } from "lucide-react";

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
    action: () => undefined,
  },
  {
    id: "resume-all",
    label: "Resume All",
    shortcut: "⌘R",
    action: () => undefined,
  },
  {
    id: "stop-session",
    label: "Stop Session",
    shortcut: "⌘S",
    action: () => undefined,
  },
];

const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  onSearch,
  quickActions = DEFAULT_QUICK_ACTIONS,
  placeholder = "Search agents, tasks, or enter command...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isOverflowOpen, setIsOverflowOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const overflowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        overflowRef.current &&
        !overflowRef.current.contains(event.target as Node)
      ) {
        setIsOverflowOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setSearchQuery(value);
      onSearch?.(value);
    },
    [onSearch],
  );

  const handleSearchSubmit = useCallback(
    (event: React.FormEvent) => {
      event.preventDefault();
      if (searchQuery.trim()) {
        onSearch?.(searchQuery.trim());
      }
    },
    [searchQuery, onSearch],
  );

  return (
    <nav
      aria-label="Command bar"
      className="border-b border-slate-800 bg-slate-900/80 px-3 py-2 sm:px-4"
    >
      <div className="flex w-full items-center gap-2 sm:gap-3">
        <form
          onSubmit={handleSearchSubmit}
          role="search"
          className={`relative flex-1 transition-all duration-200 ${
            isFocused ? "scale-[1.01]" : ""
          }`}
        >
          <label htmlFor="header-command-search" className="sr-only">
            Search agents, tasks, or commands
          </label>
          <div
            className={`flex items-center rounded-xl border bg-slate-800/90 transition-colors ${
              isFocused
                ? "border-cyan-500/50 ring-1 ring-cyan-500/20"
                : "border-slate-700"
            }`}
          >
            <div className="pl-3 text-slate-500">
              <Search className="h-4 w-4" />
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
              className="h-10 flex-1 bg-transparent px-3 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />

            <div className="hidden items-center space-x-1 pr-3 sm:flex">
              <kbd className="flex items-center rounded border border-slate-600 bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-slate-500">
                <Command className="h-2.5 w-2.5" />
              </kbd>
              <kbd className="rounded border border-slate-600 bg-slate-700/50 px-1.5 py-0.5 text-[10px] font-mono tabular-nums text-slate-500">
                K
              </kbd>
            </div>
          </div>
        </form>

        <div ref={overflowRef} className="relative md:hidden">
          <button
            type="button"
            onClick={() => setIsOverflowOpen((current) => !current)}
            aria-label="Open quick actions"
            aria-expanded={isOverflowOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700 bg-slate-800 text-slate-300 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          >
            <MoreHorizontal className="h-[18px] w-[18px]" />
          </button>

          {isOverflowOpen ? (
            <div className="absolute right-0 top-full z-20 mt-2 min-w-[180px] rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => {
                    action.action();
                    setIsOverflowOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs text-slate-300 transition-colors hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                >
                  <span className="flex items-center gap-2">
                    {action.icon ? <span>{action.icon}</span> : null}
                    {action.label}
                  </span>
                  {action.shortcut ? (
                    <span className="font-mono text-[10px] text-slate-500">
                      {action.shortcut}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="hidden items-center space-x-2 md:flex">
          {quickActions.map((action) => (
            <button
              key={action.id}
              onClick={action.action}
              type="button"
              aria-label={action.label}
              className="flex items-center space-x-1.5 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
              title={
                action.shortcut
                  ? `${action.label} (${action.shortcut})`
                  : action.label
              }
            >
              {action.icon ? <span>{action.icon}</span> : null}
              <span>{action.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default HeaderCommandBar;
