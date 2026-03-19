import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "agent_spawn"
  | "agent_exit"
  | "task_complete"
  | "message";

export interface NotificationAction {
  label: string;
  onClick: () => void;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
  read: boolean;
  action?: NotificationAction;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isDrawerOpen: boolean;
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">,
  ) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const DEFAULT_DURATION = 5000;
const MAX_NOTIFICATIONS = 100;

const createNotificationId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `notif-${crypto.randomUUID()}`;
  }

  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

const getUnreadCount = (notifications: Notification[]) =>
  notifications.filter((notification) => !notification.read).length;

export const useNotificationStore = create<NotificationState>()(
  immer((set) => ({
    notifications: [],
    unreadCount: 0,
    isDrawerOpen: false,

    addNotification: (notification) =>
      set((state) => {
        state.notifications.unshift({
          ...notification,
          id: createNotificationId(),
          timestamp: Date.now(),
          read: false,
          duration: notification.duration ?? DEFAULT_DURATION,
        });

        if (state.notifications.length > MAX_NOTIFICATIONS) {
          state.notifications = state.notifications.slice(0, MAX_NOTIFICATIONS);
        }

        state.unreadCount = getUnreadCount(state.notifications);
      }),

    removeNotification: (id) =>
      set((state) => {
        state.notifications = state.notifications.filter(
          (notification) => notification.id !== id,
        );
        state.unreadCount = getUnreadCount(state.notifications);
      }),

    markAsRead: (id) =>
      set((state) => {
        const notification = state.notifications.find((item) => item.id === id);

        if (notification && !notification.read) {
          notification.read = true;
          state.unreadCount = getUnreadCount(state.notifications);
        }
      }),

    markAllAsRead: () =>
      set((state) => {
        state.notifications.forEach((notification) => {
          notification.read = true;
        });
        state.unreadCount = 0;
      }),

    clearAll: () =>
      set((state) => {
        state.notifications = [];
        state.unreadCount = 0;
      }),

    toggleDrawer: () =>
      set((state) => {
        state.isDrawerOpen = !state.isDrawerOpen;
      }),

    openDrawer: () =>
      set((state) => {
        state.isDrawerOpen = true;
      }),

    closeDrawer: () =>
      set((state) => {
        state.isDrawerOpen = false;
      }),
  })),
);
