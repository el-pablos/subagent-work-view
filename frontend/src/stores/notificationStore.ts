import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

export type NotificationType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, 0 for persistent
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationState {
  toasts: Toast[];
  notifications: Record<string, Notification>;
  isDrawerOpen: boolean;
  maxVisibleToasts: number;
}

interface NotificationActions {
  // Toast actions
  addToast: (toast: Omit<Toast, "id" | "timestamp">) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;

  // Drawer actions
  openDrawer: () => void;
  closeDrawer: () => void;
  toggleDrawer: () => void;

  // Getters
  getUnreadCount: () => number;
  getRecentNotifications: (limit: number) => Notification[];
  getVisibleToasts: () => Toast[];
}

const initialState: NotificationState = {
  toasts: [],
  notifications: {},
  isDrawerOpen: false,
  maxVisibleToasts: 5,
};

let toastIdCounter = 0;
let notificationIdCounter = 0;

const generateToastId = (): string => {
  toastIdCounter += 1;
  return `toast-${toastIdCounter}-${Date.now()}`;
};

const generateNotificationId = (): string => {
  notificationIdCounter += 1;
  return `notification-${notificationIdCounter}-${Date.now()}`;
};

export const useNotificationStore = create<NotificationState & NotificationActions>()(
  immer((set, get) => ({
    ...initialState,

    // Toast actions
    addToast: (toast) => {
      const id = generateToastId();
      const newToast: Toast = {
        ...toast,
        id,
        timestamp: Date.now(),
      };

      set((state) => {
        state.toasts.push(newToast);
        // Keep only the latest toasts if exceeds max
        if (state.toasts.length > state.maxVisibleToasts * 2) {
          state.toasts = state.toasts.slice(-state.maxVisibleToasts * 2);
        }
      });

      // Auto-dismiss if duration is set
      if (toast.duration && toast.duration > 0) {
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration);
      }

      return id;
    },

    removeToast: (id) =>
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      }),

    clearAllToasts: () =>
      set((state) => {
        state.toasts = [];
      }),

    // Notification actions
    addNotification: (notification) => {
      const id = generateNotificationId();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: Date.now(),
        read: false,
      };

      set((state) => {
        state.notifications[id] = newNotification;
      });

      return id;
    },

    markAsRead: (id) =>
      set((state) => {
        if (state.notifications[id]) {
          state.notifications[id].read = true;
        }
      }),

    markAllAsRead: () =>
      set((state) => {
        Object.keys(state.notifications).forEach((id) => {
          state.notifications[id].read = true;
        });
      }),

    removeNotification: (id) =>
      set((state) => {
        delete state.notifications[id];
      }),

    clearAllNotifications: () =>
      set((state) => {
        state.notifications = {};
      }),

    // Drawer actions
    openDrawer: () =>
      set((state) => {
        state.isDrawerOpen = true;
      }),

    closeDrawer: () =>
      set((state) => {
        state.isDrawerOpen = false;
      }),

    toggleDrawer: () =>
      set((state) => {
        state.isDrawerOpen = !state.isDrawerOpen;
      }),

    // Getters
    getUnreadCount: () => {
      const state = get();
      return Object.values(state.notifications).filter((n) => !n.read).length;
    },

    getRecentNotifications: (limit) => {
      const state = get();
      return Object.values(state.notifications)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
    },

    getVisibleToasts: () => {
      const state = get();
      return state.toasts.slice(-state.maxVisibleToasts);
    },
  })),
);
