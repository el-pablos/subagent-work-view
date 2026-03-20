import React from "react";
import { Bot, ListChecks, Loader2, Menu, RefreshCcw } from "lucide-react";
import {
  ConnectionStatus as ConnectionStatusIndicator,
  HeartbeatIndicator,
  NotificationBell,
  SourceBadge,
} from "../common";
import type { SourceType } from "../common";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface HeaderProps {
  sessionId?: string;
  connectionStatus: ConnectionStatus;
  reconnectAttempt?: number;
  maxReconnectAttempts?: number;
  activeAgentCount: number;
  runningTaskCount: number;
  primarySource?: SourceType;
  onSessionChange?: (sessionId: string) => void;
  onRefresh?: () => Promise<void>;
  isRefreshing?: boolean;
}

const Header: React.FC<HeaderProps> = ({
  sessionId,
  connectionStatus,
  reconnectAttempt = 0,
  maxReconnectAttempts = 10,
  activeAgentCount,
  runningTaskCount,
  primarySource,
  onSessionChange,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <header
      aria-label="Dashboard header"
      className="border-b border-slate-800 bg-slate-900 px-3 py-1.5 sm:px-4 sm:py-2"
    >
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-800/70 text-slate-300 lg:hidden">
            <Menu aria-hidden="true" className="h-4 w-4" />
          </div>

          <div className="flex min-w-0 items-center gap-2">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 sm:h-9 sm:w-9">
              <svg
                className="h-4 w-4 text-white sm:h-5 sm:w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-base">
                SubAgent Work View
              </h1>
              {sessionId ? (
                <div className="flex items-center gap-1.5 lg:hidden">
                  <code className="max-w-[120px] truncate text-[10px] font-mono text-cyan-400">
                    {sessionId}
                  </code>
                  {onSessionChange ? (
                    <button
                      type="button"
                      onClick={() => onSessionChange("")}
                      className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      aria-label="Change session"
                    >
                      <RefreshCcw className="h-3 w-3" />
                    </button>
                  ) : null}
                </div>
              ) : (
                <p className="hidden text-[11px] text-slate-400 sm:block">
                  Real-time Multi-Agent Dashboard
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-2">
          {sessionId ? (
            <div className="hidden items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2.5 py-1.5 lg:flex">
              <span className="text-[11px] text-slate-400">Session:</span>
              <code className="max-w-[160px] truncate text-[11px] font-mono text-cyan-400">
                {sessionId}
              </code>
              {onSessionChange ? (
                <button
                  type="button"
                  onClick={() => onSessionChange("")}
                  className="rounded p-0.5 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                  aria-label="Change session"
                >
                  <RefreshCcw className="h-3 w-3" />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-2 sm:items-center lg:justify-end lg:gap-2">
            <div className="hidden sm:flex sm:items-center sm:gap-2">
              {onRefresh ? (
                <button
                  type="button"
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="relative rounded-lg p-1.5 text-slate-400 transition-colors hover:text-cyan-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={
                    isRefreshing ? "Refreshing data..." : "Refresh data"
                  }
                  title={
                    isRefreshing ? "Refreshing data..." : "Refresh all data"
                  }
                >
                  {isRefreshing ? (
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              ) : null}
              <NotificationBell />
            </div>

            <div className="flex flex-1 flex-col gap-1.5 sm:flex-row sm:flex-none sm:items-center sm:gap-2">
              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2 py-1 sm:min-w-[90px] sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <Bot aria-hidden="true" className="h-3 w-3 text-violet-400" />
                  <span className="text-[10px] text-slate-400">Agents</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  {activeAgentCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2 py-1 sm:min-w-[90px] sm:justify-start">
                <div className="flex items-center gap-1.5">
                  <ListChecks
                    aria-hidden="true"
                    className="h-3 w-3 text-sky-400"
                  />
                  <span className="text-[10px] text-slate-400">Tasks</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  {runningTaskCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-800/50 px-2 py-1">
              {connectionStatus === "connecting" && reconnectAttempt > 0 ? (
                <>
                  <Loader2
                    className="h-3 w-3 animate-spin text-yellow-400"
                    aria-hidden="true"
                  />
                  <span className="text-[10px] text-yellow-400">
                    Reconnecting... ({reconnectAttempt}/{maxReconnectAttempts})
                  </span>
                </>
              ) : (
                <>
                  <ConnectionStatusIndicator status={connectionStatus} />
                  <HeartbeatIndicator
                    isAlive={connectionStatus === "connected"}
                    size="sm"
                  />
                  {primarySource ? (
                    <SourceBadge source={primarySource} size="sm" />
                  ) : null}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
