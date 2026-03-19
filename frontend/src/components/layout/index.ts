// Layout components exports
export { default as WarRoomLayout } from "./WarRoomLayout";
export { default as Header } from "./Header";
export { default as HeaderCommandBar } from "./HeaderCommandBar";

// Lazy-loaded panel wrappers (performance optimization)
export {
  AgentTopologyPanel as LazyAgentTopologyPanel,
  ActiveTaskPanel as LazyActiveTaskPanel,
  CommunicationLogPanel as LazyCommunicationLogPanel,
} from "./LazyPanels";

// Types
export type { WarRoomLayoutProps } from "./WarRoomLayout";
export type { HeaderProps, ConnectionStatus } from "./Header";
export type { HeaderCommandBarProps, QuickAction } from "./HeaderCommandBar";
