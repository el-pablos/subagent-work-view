import React from "react";

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
    <header className="bg-slate-900 border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            {/* Logo Icon */}
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                SubAgent Work View
              </h1>
              <p className="text-xs text-slate-500 -mt-0.5">
                Real-time Multi-Agent Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Center: Session Indicator */}
        <div className="flex items-center space-x-3">
          {sessionId && (
            <div className="flex items-center space-x-2 bg-slate-800/50 rounded-lg px-3 py-1.5">
              <span className="text-xs text-slate-400">Session:</span>
              <code className="text-xs font-mono text-cyan-400">
                {sessionId.slice(0, 8)}...
              </code>
              {onSessionChange && (
                <button
                  onClick={() => onSessionChange("")}
                  className="text-slate-500 hover:text-slate-300 transition-colors"
                  title="Change session"
                >
                  <svg
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
        <div className="flex items-center space-x-4">
          {/* Quick Stats */}
          <div className="flex items-center space-x-3">
            {/* Active Agents */}
            <div className="flex items-center space-x-1.5 bg-slate-800/50 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-purple-500" />
              <span className="text-xs text-slate-400">Agents:</span>
              <span className="text-sm font-semibold text-white">
                {activeAgentCount}
              </span>
            </div>

            {/* Running Tasks */}
            <div className="flex items-center space-x-1.5 bg-slate-800/50 rounded-lg px-3 py-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-xs text-slate-400">Tasks:</span>
              <span className="text-sm font-semibold text-white">
                {runningTaskCount}
              </span>
            </div>
          </div>

          {/* Connection Status */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className={`w-2.5 h-2.5 rounded-full ${statusConfig.color}`}>
                {connectionStatus === "connected" && (
                  <div
                    className={`absolute inset-0 rounded-full ${statusConfig.pulseColor} animate-ping opacity-75`}
                  />
                )}
              </div>
            </div>
            <span className={`text-xs font-medium ${statusConfig.textColor}`}>
              {statusConfig.text}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
