import React from "react";
import { Activity, Cpu, Menu, RefreshCcw } from "lucide-react";
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
  activeAgentCount: number;
  runningTaskCount: number;
  primarySource?: SourceType;
  onSessionChange?: (sessionId: string) => void;
}

const Header: React.FC<HeaderProps> = ({
  sessionId,
  connectionStatus,
  activeAgentCount,
  runningTaskCount,
  primarySource,
  onSessionChange,
}) => {
  return (
    <header aria-label="Dashboard header" className="border-b border-slate-800 bg-slate-900 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/70 text-slate-300 lg:hidden">
            <Menu aria-hidden="true" className="h-[18px] w-[18px]" />
          </div>

          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 sm:h-10 sm:w-10">
              <svg
                className="h-5 w-5 text-white"
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
              <h1 className="truncate text-sm font-bold tracking-tight text-white sm:text-base lg:text-lg">
                SubAgent Work View
              </h1>
              <p className="hidden text-xs text-slate-400 sm:block">
                Real-time Multi-Agent Dashboard
              </p>

              {sessionId ? (
                <div className="mt-1 flex items-center gap-2 lg:hidden">
                  <span className="rounded-md border border-slate-700 bg-slate-800/70 px-2 py-1 text-[10px] text-slate-300">
                    Session
                  </span>
                  <code className="max-w-[140px] truncate rounded-md border border-cyan-500/20 bg-cyan-500/10 px-2 py-1 text-[10px] font-mono text-cyan-300">
                    {sessionId}
                  </code>
                  {onSessionChange ? (
                    <button
                      type="button"
                      onClick={() => onSessionChange("")}
                      className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                      aria-label="Change session"
                    >
                      <RefreshCcw className="h-3.5 w-3.5" />
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-3">
          {sessionId ? (
            <div className="hidden items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-2 lg:flex">
              <span className="text-xs text-slate-400">Session:</span>
              <code className="max-w-[180px] truncate text-xs font-mono text-cyan-400">
                {sessionId}
              </code>
              {onSessionChange ? (
                <button
                  type="button"
                  onClick={() => onSessionChange("")}
                  className="rounded-md p-1 text-slate-400 transition-colors hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  aria-label="Change session"
                >
                  <RefreshCcw className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-start justify-between gap-2 sm:items-center lg:justify-end lg:gap-3">
            <div className="hidden sm:block">
              <NotificationBell />
            </div>

            <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:flex-none sm:items-center">
              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-2 sm:min-w-[110px] sm:justify-start">
                <div className="flex items-center gap-2">
                  <Cpu aria-hidden="true" className="h-3.5 w-3.5 text-violet-400" />
                  <span className="text-[11px] text-slate-400">Agents</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {activeAgentCount}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-2 sm:min-w-[110px] sm:justify-start">
                <div className="flex items-center gap-2">
                  <Activity aria-hidden="true" className="h-3.5 w-3.5 text-sky-400" />
                  <span className="text-[11px] text-slate-400">Tasks</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {runningTaskCount}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-2 py-1.5">
              <ConnectionStatusIndicator status={connectionStatus} />
              <HeartbeatIndicator
                isAlive={connectionStatus === "connected"}
                size="sm"
              />
              {primarySource ? (
                <SourceBadge source={primarySource} size="sm" />
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
