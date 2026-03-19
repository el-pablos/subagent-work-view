import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Make Pusher available globally for Laravel Echo
declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"pusher">;
  }
}

window.Pusher = Pusher;

// Configuration from environment variables
const pusherConfig = {
  key: import.meta.env.VITE_PUSHER_APP_KEY || "",
  cluster: import.meta.env.VITE_PUSHER_CLUSTER || "mt1",
  wsHost: import.meta.env.VITE_PUSHER_HOST || "localhost",
  wsPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
  wssPort: Number(import.meta.env.VITE_PUSHER_PORT) || 6001,
  forceTLS: import.meta.env.VITE_PUSHER_SCHEME === "https",
  enabledTransports: ["ws", "wss"] as ("ws" | "wss")[],
  disableStats: true,
};

// Initialize Laravel Echo with Pusher driver
const echo = new Echo({
  broadcaster: "pusher",
  key: pusherConfig.key,
  cluster: pusherConfig.cluster,
  wsHost: pusherConfig.wsHost,
  wsPort: pusherConfig.wsPort,
  wssPort: pusherConfig.wssPort,
  forceTLS: pusherConfig.forceTLS,
  enabledTransports: pusherConfig.enabledTransports,
  disableStats: pusherConfig.disableStats,
});

// Expose echo globally for debugging
window.Echo = echo;

// Connection state management
export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";

let connectionState: ConnectionState = "connecting";
const connectionListeners: Set<(state: ConnectionState) => void> = new Set();

// Monitor connection state
echo.connector.pusher.connection.bind("connected", () => {
  connectionState = "connected";
  notifyConnectionListeners();
  console.log("[WebSocket] Connected to Pusher");
});

echo.connector.pusher.connection.bind("disconnected", () => {
  connectionState = "disconnected";
  notifyConnectionListeners();
  console.log("[WebSocket] Disconnected from Pusher");
});

echo.connector.pusher.connection.bind("failed", () => {
  connectionState = "failed";
  notifyConnectionListeners();
  console.error("[WebSocket] Failed to connect to Pusher");
});

echo.connector.pusher.connection.bind("connecting", () => {
  connectionState = "connecting";
  notifyConnectionListeners();
  console.log("[WebSocket] Connecting to Pusher...");
});

function notifyConnectionListeners() {
  connectionListeners.forEach((listener) => listener(connectionState));
}

// Export utilities
export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function onConnectionStateChange(
  callback: (state: ConnectionState) => void,
): () => void {
  connectionListeners.add(callback);
  // Immediately notify with current state
  callback(connectionState);
  // Return unsubscribe function
  return () => connectionListeners.delete(callback);
}

export function reconnect(): void {
  echo.connector.pusher.connect();
}

export function disconnect(): void {
  echo.connector.pusher.disconnect();
}

// Channel helpers
export function subscribeToChannel(channelName: string) {
  return echo.channel(channelName);
}

export function subscribeToPrivateChannel(channelName: string) {
  return echo.private(channelName);
}

export function leaveChannel(channelName: string) {
  echo.leave(channelName);
}

export { echo };
export default echo;
