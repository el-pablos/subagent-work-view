import React from "react";
import { Activity, Cpu } from "lucide-react";
import { NotificationBell } from "../common";

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export interface HeaderProps {
  sessionId?: string;
  connectionStatus: ConnectionStatus;
  activeAgentCount: number;
  runningTaskCount: number;
  onSessionChange?: (sessionId: string) => void;
}

const getConnectionStatusConfig = (status: ConnectionStatus) => {
  switch (status) {
    case "connected":
      return {
        color: "bg-emerald-500",
        pulseColor: "bg-emerald-400",
        text: "Connected",
        textColor: "text-emerald-400",
      };
    case "connecting":
      return {
        color: "bg-amber-500",
        pulseColor: "bg-amber-400",
        text: "Connecting...",
        textColor: "text-amber-400",
      };
    case "disconnected":
      return {
        color: "bg-red-500",
        pulseColor: "bg-red-400",
        text: "Disconnected",
        textColor: "text-red-400",
      };
  }
};

const Header: React.FC<HeaderProps> = ({
  sessionId,
  connectionStatus,
  activeAgentCount,
  runningTaskCount,
  onSessionChange,
}) => {
  const statusConfig = getConnectionStatusConfig(connectionStatus);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-3 py-2 sm:px-4 sm:py-3">
      <div className="flex items-center justify-between gap-2">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-shrink">
          <div className="flex items-center space-x-1.5 sm:space-x-2 min-w-0">
            {/* Logo Icon */}
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg
                aria-hidden="true"
                className="w-4 h-4 sm:w-5 sm:h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
                />
              </svg>
            </div>
            <div className="min-w-0">
              <h1 className="text-fluid-base sm:text-fluid-xl font-semibold text-white tracking-tight truncate">
                SubAgent Work View
              </h1>
              <p className="text-fluid-xs sm:text-fluid-sm text-slate-400 -mt-0.5 hidden sm:block">
                Real-time Multi-Agent Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Center: Session Indicator - Hidden on mobile */}
        <div className="hidden lg:flex items-center space-x-3">
          {sessionId && (
            <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-1.5">
              <span className="text-fluid-xs text-slate-400">Session:</span>
              <code className="text-fluid-xs font-mono tabular-nums text-cyan-400">
                {sessionId.slice(0, 8)}...
              </code>
              {onSessionChange && (
                <button
                  onClick={() => onSessionChange("")}
                  className="rounded text-slate-400 transition-colors hover:text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
                  title="Change session"
                  aria-label="Change session"
                >
                  <svg
                    aria-hidden="true"
                    className="w-3.5 h-3.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Status and Stats */}
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
          {/* Notification Bell */}
          <NotificationBell />

          {/* Quick Stats */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            {/* Active Agents */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-800/50 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
              <Cpu
                aria-hidden="true"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-500"
              />
               <span className="text-[10px] sm:text-fluid-xs text-slate-400 hidden sm:inline">Agents:</span>
               <span className="tabular-nums text-fluid-sm sm:text-fluid-base font-semibold text-white">
                 {activeAgentCount}
               </span>
            </div>

            {/* Running Tasks */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-800/50 rounded-lg px-2 py-1 sm:px-3 sm:py-1.5">
              <Activity
                aria-hidden="true"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500"
              />
               <span className="text-[10px] sm:text-fluid-xs text-slate-400 hidden sm:inline">Tasks:</span>
               <span className="tabular-nums text-fluid-sm sm:text-fluid-base font-semibold text-white">
                 {runningTaskCount}
               </span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            <div className="relative">
              <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${statusConfig.color}`}>
                {connectionStatus === "connected" && (
                  <div
                    className={`absolute inset-0 rounded-full ${statusConfig.pulseColor} animate-ping opacity-75`}
                  />
                )}
              </div>
            </div>
            <span className={`text-[10px] sm:text-fluid-xs font-medium ${statusConfig.textColor} hidden sm:inline`}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
