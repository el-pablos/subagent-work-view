import React, { useCallback, useEffect, useRef, useState } from "react";
import { Command, Search } from "lucide-react";

export interface HeaderCommandBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

const HeaderCommandBar: React.FC<HeaderCommandBarProps> = ({
  onSearch,
  placeholder = "Search agents, tasks, or enter command...",
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
      <div className="flex w-full items-center">
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
      </div>
    </nav>
  );
};

export default HeaderCommandBar;
