import { act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotificationStore } from '../notificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
      isDrawerOpen: false,
    });
  });

  it('adds notifications to the front of the list and applies default metadata', () => {
    const store = useNotificationStore.getState();

    act(() => {
      store.addNotification({
        type: 'success',
        title: 'Tersimpan',
        message: 'Perubahan berhasil disimpan',
      });
      vi.advanceTimersByTime(10);
      store.addNotification({
        type: 'warning',
        title: 'Perlu perhatian',
        message: 'Ada perubahan lanjutan',
        duration: 1200,
      });
    });

    const { notifications, unreadCount } = useNotificationStore.getState();

    expect(notifications).toHaveLength(2);
    expect(notifications[0]).toMatchObject({
      title: 'Perlu perhatian',
      message: 'Ada perubahan lanjutan',
      type: 'warning',
      duration: 1200,
      read: false,
    });
    expect(notifications[1]).toMatchObject({
      title: 'Tersimpan',
      type: 'success',
      duration: 5000,
      read: false,
    });
    expect(notifications[0].id).toMatch(/^notif-/);
    expect(unreadCount).toBe(2);
  });

  it('marks notifications as read, removes them, and keeps unread totals in sync', () => {
    const store = useNotificationStore.getState();

    act(() => {
      store.addNotification({
        type: 'info',
        title: 'Info lama',
        message: 'Pesan pertama',
      });
      vi.advanceTimersByTime(10);
      store.addNotification({
        type: 'warning',
        title: 'Info baru',
        message: 'Pesan kedua',
      });
    });

    const [latest, earliest] = useNotificationStore.getState().notifications;

    expect(latest.title).toBe('Info baru');
    expect(earliest.title).toBe('Info lama');
    expect(useNotificationStore.getState().unreadCount).toBe(2);

    act(() => {
      store.markAsRead(earliest.id);
    });

    expect(
      useNotificationStore.getState().notifications.find((item) => item.id === earliest.id)?.read,
    ).toBe(true);
    expect(useNotificationStore.getState().unreadCount).toBe(1);

    act(() => {
      store.markAllAsRead();
      store.removeNotification(latest.id);
    });

    expect(useNotificationStore.getState().unreadCount).toBe(0);
    expect(useNotificationStore.getState().notifications).toHaveLength(1);
    expect(useNotificationStore.getState().notifications[0].id).toBe(earliest.id);
  });

  it('opens, toggles, and clears the drawer and notification collection', () => {
    const store = useNotificationStore.getState();

    act(() => {
      store.openDrawer();
      store.addNotification({ type: 'error', title: 'Notif', message: 'Alert' });
    });

    expect(useNotificationStore.getState().isDrawerOpen).toBe(true);
    expect(useNotificationStore.getState().notifications).toHaveLength(1);

    act(() => {
      store.toggleDrawer();
      store.clearAll();
      store.closeDrawer();
    });

    expect(useNotificationStore.getState().isDrawerOpen).toBe(false);
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });
});
