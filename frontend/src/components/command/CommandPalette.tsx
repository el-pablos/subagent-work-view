import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type ReactNode,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Command,
  Hash,
  ListTodo,
  MessageSquare,
  Search,
  Settings,
  Users,
  Zap,
} from "lucide-react";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

export interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  agents?: Agent[];
  onNavigateToAgent?: (id: string) => void;
  onNavigateToTask?: (id: string) => void;
  onExecuteCommand?: (command: string) => void;
}

export interface Agent {
  id: string;
  name: string;
}

const CATEGORY_ORDER = ["Navigation", "Commands", "Agents"] as const;

function matchesQuery(command: CommandItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    command.label,
    command.description ?? "",
    command.category,
    command.shortcut ?? "",
  ].some((value) => value.toLowerCase().includes(normalizedQuery));
}

export function CommandPalette({
  isOpen,
  onClose,
  agents = [],
  onNavigateToAgent,
  onNavigateToTask,
  onExecuteCommand,
}: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const titleId = useId();
  const listboxId = useId();

  const executeAndClose = useCallback(
    (action: () => void) => {
      action();
      onClose();
    },
    [onClose],
  );

  const commands = useMemo<CommandItem[]>(
    () => [
      {
        id: "nav-topology",
        label: "Go to Topology",
        description: "Open the topology overview",
        category: "Navigation",
        icon: <Users className="h-4 w-4" aria-hidden="true" />,
        action: () => onExecuteCommand?.("nav-topology"),
      },
      {
        id: "nav-tasks",
        label: "Go to Tasks",
        description: "Open the active tasks view",
        category: "Navigation",
        icon: <ListTodo className="h-4 w-4" aria-hidden="true" />,
        action: () => {
          onNavigateToTask?.("tasks");
          onExecuteCommand?.("nav-tasks");
        },
      },
      {
        id: "nav-comms",
        label: "Go to Communications",
        description: "Open communication activity",
        category: "Navigation",
        icon: <MessageSquare className="h-4 w-4" aria-hidden="true" />,
        action: () => onExecuteCommand?.("nav-comms"),
      },
      {
        id: "cmd-refresh",
        label: "Refresh Data",
        description: "Reload the latest dashboard data",
        category: "Commands",
        icon: <Zap className="h-4 w-4" aria-hidden="true" />,
        shortcut: "⌘R",
        action: () => onExecuteCommand?.("cmd-refresh"),
      },
      {
        id: "cmd-settings",
        label: "Settings",
        description: "Open application settings",
        category: "Commands",
        icon: <Settings className="h-4 w-4" aria-hidden="true" />,
        action: () => onExecuteCommand?.("cmd-settings"),
      },
      ...agents.map((agent) => ({
        id: `agent-${agent.id}`,
        label: `Agent: ${agent.name}`,
        description: "Open agent details",
        category: "Agents",
        icon: <Hash className="h-4 w-4" aria-hidden="true" />,
        action: () => onNavigateToAgent?.(agent.id),
      })),
    ],
    [agents, onExecuteCommand, onNavigateToAgent, onNavigateToTask],
  );

  const filteredCommands = useMemo(
    () => commands.filter((command) => matchesQuery(command, query)),
    [commands, query],
  );

  const groupedCommands = useMemo(() => {
    return filteredCommands.reduce<Record<string, Array<CommandItem & { index: number }>>>(
      (accumulator, command, index) => {
        const items = accumulator[command.category] ?? [];

        items.push({
          ...command,
          index,
        });

        accumulator[command.category] = items;
        return accumulator;
      },
      {},
    );
  }, [filteredCommands]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuery("");
    setSelectedIndex(0);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (selectedIndex <= filteredCommands.length - 1) {
      return;
    }

    setSelectedIndex(Math.max(filteredCommands.length - 1, 0));
  }, [filteredCommands.length, selectedIndex]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();

        if (isOpen) {
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen || !resultsRef.current) {
      return;
    }

    const activeItem = resultsRef.current.querySelector<HTMLElement>(
      `[data-command-index="${selectedIndex}"]`,
    );

    activeItem?.scrollIntoView({
      block: "nearest",
    });
  }, [isOpen, selectedIndex]);

  const handleSelect = useCallback(
    (index: number) => {
      const selectedCommand = filteredCommands[index];

      if (!selectedCommand) {
        return;
      }

      executeAndClose(selectedCommand.action);
    },
    [executeAndClose, filteredCommands],
  );

  const trapFocus = useCallback((event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          setSelectedIndex((currentIndex) =>
            Math.min(currentIndex + 1, Math.max(filteredCommands.length - 1, 0)),
          );
          break;
        case "ArrowUp":
          event.preventDefault();
          setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
          break;
        case "Enter":
          event.preventDefault();
          handleSelect(selectedIndex);
          break;
        case "Escape":
          event.preventDefault();
          onClose();
          break;
        case "Tab":
          event.preventDefault();
          inputRef.current?.focus();
          break;
      }
    },
    [filteredCommands.length, handleSelect, onClose, selectedIndex],
  );

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.16, ease: [0.4, 0, 0.2, 1] }}
            className="fixed left-1/2 top-[10vh] z-[60] w-full max-w-2xl -translate-x-1/2 px-3 sm:px-4"
            onClick={(event) => event.stopPropagation()}
            onKeyDownCapture={trapFocus}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="glass-panel overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-900/95 shadow-2xl">
              <div className="sr-only" id={titleId}>
                Command palette
              </div>

              <div className="flex items-center gap-3 border-b border-slate-700/50 px-4 py-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300">
                  <Command className="h-4 w-4" aria-hidden="true" />
                </div>

                <Search className="h-5 w-5 shrink-0 text-slate-400" aria-hidden="true" />

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ketik command atau cari..."
                  className="flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  role="combobox"
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-expanded={filteredCommands.length > 0}
                  aria-haspopup="listbox"
                  aria-activedescendant={
                    filteredCommands[selectedIndex]
                      ? `${listboxId}-option-${selectedIndex}`
                      : undefined
                  }
                  aria-label="Search commands"
                />

                <kbd className="hidden items-center gap-1 rounded-md border border-slate-700 bg-slate-800 px-2 py-0.5 text-[10px] font-mono text-slate-400 sm:inline-flex">
                  ESC
                </kbd>
              </div>

              <div
                ref={resultsRef}
                id={listboxId}
                role="listbox"
                aria-label="Command results"
                className="max-h-[min(60vh,28rem)] overflow-y-auto py-2"
              >
                {CATEGORY_ORDER.filter((category) => groupedCommands[category]?.length).map(
                  (category) => (
                    <div key={category}>
                      <div className="px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                        {category}
                      </div>

                      {groupedCommands[category]?.map((item) => {
                        const isSelected = item.index === selectedIndex;

                        return (
                          <button
                            key={item.id}
                            id={`${listboxId}-option-${item.index}`}
                            type="button"
                            role="option"
                            tabIndex={-1}
                            aria-selected={isSelected}
                            data-command-index={item.index}
                            onMouseDown={(event) => event.preventDefault()}
                            onMouseEnter={() => setSelectedIndex(item.index)}
                            onClick={() => handleSelect(item.index)}
                            className={`mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition-colors ${
                              isSelected
                                ? "bg-cyan-500/10 text-cyan-300"
                                : "text-slate-300 hover:bg-slate-800/60"
                            }`}
                          >
                            <span
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                isSelected
                                  ? "bg-cyan-500/15 text-cyan-300"
                                  : "bg-slate-800/70 text-slate-400"
                              }`}
                            >
                              {item.icon}
                            </span>

                            <span className="min-w-0 flex-1">
                              <span className="block truncate font-medium">{item.label}</span>
                              {item.description ? (
                                <span className="block truncate text-xs text-slate-500">
                                  {item.description}
                                </span>
                              ) : null}
                            </span>

                            {item.shortcut ? (
                              <kbd className="hidden rounded border border-slate-700 bg-slate-800/80 px-2 py-0.5 text-[10px] font-mono text-slate-500 sm:inline-block">
                                {item.shortcut}
                              </kbd>
                            ) : null}

                            <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-600" aria-hidden="true" />
                          </button>
                        );
                      })}
                    </div>
                  ),
                )}

                {filteredCommands.length === 0 ? (
                  <div className="px-4 py-10 text-center text-sm text-slate-500">
                    Tidak ada hasil untuk &quot;{query}&quot;
                  </div>
                ) : null}
              </div>

              <div className="flex flex-wrap items-center gap-4 border-t border-slate-700/50 px-4 py-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">↑↓</kbd>
                  navigasi
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">↵</kbd>
                  pilih
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="font-mono">esc</kbd>
                  tutup
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default CommandPalette;
