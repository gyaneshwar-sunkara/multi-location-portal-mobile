import { renderHook, act } from '@testing-library/react-native';

// Mock all external dependencies
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  requestPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getDevicePushTokenAsync: jest.fn().mockResolvedValue({ data: 'push-token-123' }),
  addNotificationReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  addNotificationResponseReceivedListener: jest.fn(() => ({ remove: jest.fn() })),
  setNotificationChannelAsync: jest.fn(),
  AndroidImportance: { MAX: 5 },
}));

jest.mock('expo-device', () => ({
  isDevice: true,
  deviceName: 'Test Device',
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const mockInvalidateQueries = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));

jest.mock('@/lib/api-client', () => ({
  apiFetch: jest.fn().mockResolvedValue({ ok: true }),
}));

jest.mock('@/lib/query-keys', () => ({
  qk: {
    notificationsUnread: ['notifications', 'unread'],
    notifications: ['notifications'],
  },
}));

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { useAuthStore } from '@/stores/auth-store';
import { apiFetch } from '@/lib/api-client';
import { usePushNotifications } from './use-push-notifications';

beforeEach(() => {
  jest.clearAllMocks();
  useAuthStore.setState({ isAuthenticated: false });
  // Reset device mock
  (Device as any).isDevice = true;
});

describe('usePushNotifications', () => {
  it('does not set up listeners when not authenticated', () => {
    renderHook(() => usePushNotifications());

    expect(Notifications.addNotificationReceivedListener).not.toHaveBeenCalled();
  });

  it('sets up notification listeners when authenticated', () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    expect(Notifications.addNotificationReceivedListener).toHaveBeenCalled();
    expect(Notifications.addNotificationResponseReceivedListener).toHaveBeenCalled();
  });

  it('registers push token when authenticated', async () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    // Flush all pending microtasks from async registerPushToken
    await act(async () => {});

    expect(Notifications.getPermissionsAsync).toHaveBeenCalled();
    expect(apiFetch).toHaveBeenCalledWith('/push-tokens', expect.objectContaining({
      method: 'POST',
    }));
  });

  it('cleans up listeners on unmount', () => {
    useAuthStore.setState({ isAuthenticated: true });

    const removeFn = jest.fn();
    (Notifications.addNotificationReceivedListener as jest.Mock).mockReturnValueOnce({ remove: removeFn });
    (Notifications.addNotificationResponseReceivedListener as jest.Mock).mockReturnValueOnce({ remove: removeFn });

    const { unmount } = renderHook(() => usePushNotifications());
    unmount();

    expect(removeFn).toHaveBeenCalledTimes(2);
  });

  it('invalidates queries on foreground notification', () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    const callback = (Notifications.addNotificationReceivedListener as jest.Mock).mock.calls[0][0];
    callback();

    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications', 'unread'] });
    expect(mockInvalidateQueries).toHaveBeenCalledWith({ queryKey: ['notifications'] });
  });

  it('navigates on notification tap', () => {
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    const callback = (Notifications.addNotificationResponseReceivedListener as jest.Mock).mock.calls[0][0];
    callback();

    expect(mockPush).toHaveBeenCalledWith('/(app)/(tabs)/notifications');
  });

  it('requests permission when not already granted', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'undetermined' });
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
  });

  it('does not register when not a physical device', async () => {
    (Device as any).isDevice = false;
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('does not register when permission denied', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: 'denied' });
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('handles push token registration error gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    (apiFetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    useAuthStore.setState({ isAuthenticated: true });

    renderHook(() => usePushNotifications());

    await act(async () => {});

    expect(consoleSpy).toHaveBeenCalledWith(
      'Push token registration error:',
      expect.any(Error),
    );
    consoleSpy.mockRestore();
  });
});
