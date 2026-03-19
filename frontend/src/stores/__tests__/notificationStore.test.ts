import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationStore } from '../notificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({
      toasts: [],
      notifications: {},
      isDrawerOpen: false,
      maxVisibleToasts: 5,
    });
  });

  it('adds a toast and removes it automatically after its duration', () => {
    const store = useNotificationStore.getState();

    let toastId = '';
    act(() => {
      toastId = store.addToast({ type: 'success', message: 'Tersimpan', duration: 500 });
    });

    expect(useNotificationStore.getState().toasts[0]).toMatchObject({
      id: toastId,
      message: 'Tersimpan',
      type: 'success',
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(useNotificationStore.getState().toasts).toHaveLength(0);
  });

  it('manages notification read states and recent ordering', () => {
    const store = useNotificationStore.getState();

    let firstId = '';
    let secondId = '';

    act(() => {
      firstId = store.addNotification({
        type: 'info',
        title: 'Info lama',
        message: 'Pesan pertama',
      });
    });

    act(() => {
      vi.advanceTimersByTime(10);
      secondId = store.addNotification({
        type: 'warning',
        title: 'Info baru',
        message: 'Pesan kedua',
      });
    });

    expect(useNotificationStore.getState().getUnreadCount()).toBe(2);

    act(() => {
      store.markAsRead(firstId);
    });

    expect(useNotificationStore.getState().notifications[firstId].read).toBe(true);
    expect(useNotificationStore.getState().getUnreadCount()).toBe(1);
    expect(useNotificationStore.getState().getRecentNotifications(1)[0].id).toBe(secondId);

    act(() => {
      store.markAllAsRead();
    });

    expect(useNotificationStore.getState().getUnreadCount()).toBe(0);
  });

  it('opens, toggles, and clears drawer state and collections', () => {
    const store = useNotificationStore.getState();

    act(() => {
      store.openDrawer();
      store.addToast({ type: 'error', message: 'Toast' });
      store.addNotification({ type: 'error', title: 'Notif', message: 'Alert' });
    });

    expect(useNotificationStore.getState().isDrawerOpen).toBe(true);
    expect(useNotificationStore.getState().getVisibleToasts()).toHaveLength(1);

    act(() => {
      store.toggleDrawer();
      store.clearAllToasts();
      store.clearAllNotifications();
      store.closeDrawer();
    });

    expect(useNotificationStore.getState().isDrawerOpen).toBe(false);
    expect(useNotificationStore.getState().toasts).toHaveLength(0);
    expect(Object.keys(useNotificationStore.getState().notifications)).toHaveLength(0);
  });
});
