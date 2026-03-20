import Echo from "laravel-echo";
import Pusher from "pusher-js";

declare global {
  interface Window {
    Pusher: typeof Pusher;
    Echo: Echo<"pusher">;
  }
}

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: "pusher",
  key: import.meta.env.VITE_WS_KEY || "app-key",
  cluster: import.meta.env.VITE_WS_CLUSTER || "mt1",
  wsHost: import.meta.env.VITE_WS_HOST || "localhost",
  wsPort: Number(import.meta.env.VITE_WS_PORT) || 6001,
  wssPort: Number(import.meta.env.VITE_WS_PORT) || 6001,
  forceTLS: false,
  encrypted: false,
  disableStats: true,
  enabledTransports: ["ws", "wss"],
  activityTimeout: 120000,
  pongTimeout: 30000,
});

window.Echo = echo;

export type ConnectionState =
  | "connecting"
  | "connected"
  | "disconnected"
  | "failed";

let connectionState: ConnectionState = "connecting";
const connectionListeners: Set<(state: ConnectionState) => void> = new Set();

// Auto-reconnect configuration
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 10;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 30000;

function scheduleReconnect(): void {
  if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
    connectionState = "failed";
    notifyConnectionListeners();
    return;
  }
  const delay = Math.min(
    BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttempts),
    MAX_RECONNECT_DELAY,
  );
  console.log(
    `[WebSocket] Reconnecting in ${delay}ms (attempt ${reconnectAttempts + 1})`,
  );
  setTimeout(() => {
    reconnectAttempts++;
    echo.connector.pusher.connect();
  }, delay);
}

function notifyConnectionListeners() {
  connectionListeners.forEach((listener) => listener(connectionState));
}

const pusherConnection = echo.connector.pusher.connection;

pusherConnection.bind("connected", () => {
  reconnectAttempts = 0;
  connectionState = "connected";
  notifyConnectionListeners();
});

pusherConnection.bind("disconnected", () => {
  connectionState = "disconnected";
  notifyConnectionListeners();
  scheduleReconnect();
});

pusherConnection.bind("failed", () => {
  connectionState = "failed";
  notifyConnectionListeners();
});

pusherConnection.bind("connecting", () => {
  connectionState = "connecting";
  notifyConnectionListeners();
});

pusherConnection.bind("unavailable", () => {
  connectionState = "disconnected";
  notifyConnectionListeners();
});

export function getConnectionState(): ConnectionState {
  return connectionState;
}

export function onConnectionStateChange(
  callback: (state: ConnectionState) => void,
): () => void {
  connectionListeners.add(callback);
  callback(connectionState);

  return () => connectionListeners.delete(callback);
}

export function reconnect(): void {
  if (pusherConnection.state !== "connected") {
    echo.connector.pusher.connect();
  }
}

export function disconnect(): void {
  echo.connector.pusher.disconnect();
}

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
